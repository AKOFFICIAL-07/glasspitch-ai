/**
 * Client-side Algorand wallet helpers for the x402 premium gate.
 *
 * Heavily-dynamic imports keep algosdk + wallet SDKs out of the main bundle —
 * they only load when a user actually opens the payment gate.
 */

export type WalletKind = "pera" | "lute" | "manual";

export interface X402ClientConfig {
  network: "testnet" | "mainnet";
  genesisID: string;
  algodUrl: string;
  indexerUrl: string;
  receiverAddress: string;
  amountAlgo: number;
  amountMicro: number;
  assetId: number;
  explorerBase: string;
}

/** Connect the Pera wallet (mobile / extension via WalletConnect v2). */
export async function connectPera(): Promise<string> {
  const { PeraWalletConnect } = await import("@perawallet/connect");
  const pera = new PeraWalletConnect();
  const accounts = await pera.connect();
  if (!accounts?.[0]) throw new Error("No account selected in Pera.");
  return accounts[0];
}

/** Connect the Lute wallet (browser extension / lute.app). */
export async function connectLute(genesisID: string): Promise<string> {
  const { default: LuteConnect } = await import("lute-connect");
  const lute = new LuteConnect("PitchForge AI");
  const addresses = await lute.connect(genesisID);
  if (!addresses?.[0]) throw new Error("No account selected in Lute.");
  return addresses[0];
}

/** Build a native ALGO payment transaction (unsigned, algosdk Transaction). */
async function buildPaymentTxn(opts: {
  from: string;
  to: string;
  amountMicro: number;
  note: string;
  algodUrl: string;
}) {
  const algosdk = await import("algosdk");
  const algod = new algosdk.Algodv2("", opts.algodUrl);
  const suggestedParams = await algod.getTransactionParams().do();
  return algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: opts.from,
    receiver: opts.to,
    amount: opts.amountMicro,
    note: new TextEncoder().encode(opts.note.slice(0, 500)),
    suggestedParams,
  });
}

/** Uint8Array -> base64 (Lute expects msgpack txns as base64 strings). */
function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/**
 * Sign + submit a payment using the connected wallet. Returns the on-chain
 * transaction id, which the server then verifies via the indexer.
 */
export async function payWithWallet(opts: {
  kind: WalletKind;
  walletAddress: string;
  to: string;
  amountMicro: number;
  note: string;
  algodUrl: string;
}): Promise<{ txId: string }> {
  if (opts.kind === "manual") {
    throw new Error("Manual mode: paste an existing transaction hash to verify.");
  }

  const txn = await buildPaymentTxn({
    from: opts.walletAddress,
    to: opts.to,
    amountMicro: opts.amountMicro,
    note: opts.note,
    algodUrl: opts.algodUrl,
  });

  if (opts.kind === "pera") {
    const { PeraWalletConnect } = await import("@perawallet/connect");
    const pera = new PeraWalletConnect();
    const signed = await pera.signTransaction([[{ txn, signers: [opts.walletAddress] }]]);
    const blob = signed?.[0];
    if (!blob) throw new Error("Pera returned no signed transaction.");
    const algosdk = await import("algosdk");
    const algod = new algosdk.Algodv2("", opts.algodUrl);
    const { txid } = await algod.sendRawTransaction(blob).do();
    return { txId: txid };
  }

  // Lute
  const [{ default: LuteConnect }, algosdk] = await Promise.all([
    import("lute-connect"),
    import("algosdk"),
  ]);
  const lute = new LuteConnect("PitchForge AI");
  const encoded = bytesToBase64(algosdk.encodeUnsignedTransaction(txn));
  const signed = await lute.signTxns([{ txn: encoded, signers: [opts.walletAddress] }]);
  const blob = signed?.[0];
  if (!blob) throw new Error("Lute returned no signed transaction.");
  const algod = new algosdk.Algodv2("", opts.algodUrl);
  const { txid } = await algod.sendRawTransaction(blob).do();
  return { txId: txid };
}

/** Explorer link for a transaction on the configured network. */
export function explorerUrl(base: string, txId: string): string {
  return `${base}/tx/${txId}`;
}

/** Explorer link for an asset. */
export function assetExplorerUrl(base: string, assetId: number): string {
  return `${base}/asset/${assetId}`;
}

/* ------------------------------------------------------------------ */
/* ARC-3 NFT minting                                                   */
/* ------------------------------------------------------------------ */

export interface Arc3Metadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
  properties: Record<string, string | number>;
}

/** Build the ARC-3 metadata JSON for a pitch deck NFT. */
export function buildArc3Metadata(opts: {
  title: string;
  tagline: string;
  creator: string;
  shareCode: string;
  origin: string;
  sections: { key: string; title: string }[];
}): Arc3Metadata {
  return {
    name: opts.title,
    description: `${opts.tagline}\n\nGenerated by PitchForge AI — an investor-ready pitch deck forged from your repository docs.`,
    image: `${opts.origin}/api/og?deck=${opts.shareCode}`,
    external_url: `${opts.origin}/d/${opts.shareCode}`,
    properties: {
      Creator: opts.creator || "Anonymous",
      Sections: opts.sections.length,
      Slides: 13,
      "Generated by": "PitchForge AI",
      ...Object.fromEntries(opts.sections.map((s, i) => [`Slide ${i + 1}`, s.title])),
    },
  };
}

/** SHA-256 hash of a string → 32-byte Uint8Array (Web Crypto API). */
async function sha256Bytes(input: string): Promise<Uint8Array> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hash);
}

/** Mint a pitch deck as an ARC-3 NFT on Algorand. Returns asset ID + tx hash. */
export async function mintDeckNft(opts: {
  kind: WalletKind;
  walletAddress: string;
  metadata: Arc3Metadata;
  algodUrl: string;
  genesisID?: string;
}): Promise<{ assetId: number; txHash: string; metadataUrl: string }> {
  const algosdk = await import("algosdk");
  const algod = new algosdk.Algodv2("", opts.algodUrl);
  const suggestedParams = await algod.getTransactionParams().do();

  // 1. Serialize metadata JSON and compute SHA-256 hash
  const jsonStr = JSON.stringify(opts.metadata, null, 2);
  const metadataHash = await sha256Bytes(jsonStr);
  const metadataDataUri = `data:application/json;base64,${btoa(jsonStr)}`;

  // 2. Build asset creation transaction (ARC-3 NFT)
  const truncate = (s: string, max: number) =>
    s.length > max ? s.slice(0, max) : s;

  const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    sender: opts.walletAddress,
    total: 1n, // 1 of 1 — true NFT
    decimals: 0,
    defaultFrozen: false,
    manager: opts.walletAddress,
    reserve: opts.walletAddress,
    freeze: undefined,
    clawback: undefined,
    assetName: truncate(opts.metadata.name, 32),
    unitName: "PITCH",
    assetURL: truncate(metadataDataUri, 96), // data URI truncated if needed
    assetMetadataHash: metadataHash,
    note: new TextEncoder().encode("PitchForge AI — ARC-3 NFT mint"),
    suggestedParams,
  });

  // 3. Sign + submit via the connected wallet
  if (opts.kind === "pera") {
    const { PeraWalletConnect } = await import("@perawallet/connect");
    const pera = new PeraWalletConnect();
    const signed = await pera.signTransaction([[{ txn, signers: [opts.walletAddress] }]]);
    const blob = signed?.[0];
    if (!blob) throw new Error("Pera returned no signed transaction.");
    const { txid } = await algod.sendRawTransaction(blob).do();
    // Wait for confirmation to get the asset ID
    const result = await algosdk.waitForConfirmation(algod, txid, 4);
    const assetId = Number(result.assetIndex ?? 0);
    return { assetId, txHash: txid, metadataUrl: metadataDataUri };
  }

  // Lute
  const { default: LuteConnect } = await import("lute-connect");
  const lute = new LuteConnect("PitchForge AI");
  const encoded = bytesToBase64(algosdk.encodeUnsignedTransaction(txn));
  const signed = await lute.signTxns([{ txn: encoded, signers: [opts.walletAddress] }]);
  const blob = signed?.[0];
  if (!blob) throw new Error("Lute returned no signed transaction.");
  const { txid } = await algod.sendRawTransaction(blob).do();
  const result = await algosdk.waitForConfirmation(algod, txid, 4);
  const assetId = Number(result.assetIndex ?? 0);
  return { assetId, txHash: txid, metadataUrl: metadataDataUri };
}
