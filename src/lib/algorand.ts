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
