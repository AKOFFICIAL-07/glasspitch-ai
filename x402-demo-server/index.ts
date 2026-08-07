/**
 * ⭐ x402 Demo Server — Main entry point
 *
 * This is a payment-protected API server using the x402 HTTP protocol.
 *
 * The x402 flow:
 * 1. Client makes request
 * 2. Server responds with 402 Payment Required + payment details (quote)
 * 3. Client signs & submits a USDC payment with their wallet
 * 4. Client retries with `Payment-Signature: {"txId":"..."}`
 * 5. Server verifies the transaction on-chain via the Algorand indexer and
 *    returns the data
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import dotenv from 'dotenv';
import { pathToFileURL } from 'node:url';

import { getPaymentConfig, getAvmAddress } from './endpoints.config.js';
import { handleWeatherRequest } from './handlers/weather.js';
import { handleAnalyticsRequest } from './handlers/analytics.js';
import { handleAiAnalysisRequest } from './handlers/ai-analysis.js';
import { handleCreatorContentRequest } from './handlers/creator-content.js';
import { handleDeckGenerationRequest } from './handlers/deck-generation.js';

dotenv.config();

const app = new Hono();
const PORT = parseInt(process.env.PORT || '4021', 10);

const NETWORK = (process.env.AVM_NETWORK ?? 'testnet').toLowerCase() === 'mainnet' ? 'mainnet' : 'testnet';

// CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Payment-Signature', 'X-Payment'],
}));

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'Deckify AI x402 API Server',
    version: '1.0.0',
    status: 'running',
    network: NETWORK,
    address: getAvmAddress(),
    verify: (process.env.X402_VERIFY ?? 'indexer').toLowerCase(),
    endpoints: Object.keys(getPaymentConfig()),
  });
});

/** AlgoNode endpoints for the configured network. */
function getAlgodUrl(): string {
  return NETWORK === 'mainnet'
    ? 'https://mainnet-api.algonode.cloud'
    : 'https://testnet-api.algonode.cloud';
}
function getIndexerUrl(): string {
  return NETWORK === 'mainnet'
    ? 'https://mainnet-idx.algonode.cloud'
    : 'https://testnet-idx.algonode.cloud';
}

/**
 * Verify a payment transaction on-chain via the Algorand indexer.
 * Requires: confirmed transaction, receiver === our merchant address,
 * correct USDC asset (or native ALGO for assetId 0), amount >= quote.
 */
async function verifyPaymentOnChain(txId: string, quote: {
  price: string;
  payTo: string;
  extra?: { asset?: number };
}): Promise<{ confirmedRound: number }> {
  const indexerUrl = process.env.AVM_INDEXER_URL ?? getIndexerUrl();
  const res = await fetch(`${indexerUrl}/v2/transactions/${txId}`, {
    headers: { Accept: 'application/json' },
  });
  if (res.status === 404) throw new Error('Transaction not found on-chain — double-check the hash.');
  if (!res.ok) throw new Error(`Indexer error (${res.status}) — try again in a moment.`);

  const body = (await res.json()) as {
    transaction?: {
      'confirmed-round'?: number;
      sender?: string;
      'payment-transaction'?: { receiver?: string; amount?: number };
      'asset-transfer-transaction'?: {
        'asset-id'?: number;
        receiver?: string;
        amount?: number;
      };
    };
  };
  const tx = body?.transaction;
  if (!tx?.['confirmed-round']) {
    throw new Error('Transaction is not confirmed on-chain yet — wait a few seconds and retry.');
  }

  const pay = tx['payment-transaction'];
  const assetT = tx['asset-transfer-transaction'];
  if (!pay && !assetT) throw new Error('This is not a payment transaction.');

  const receiver = pay?.receiver ?? assetT?.receiver;
  if (receiver !== quote.payTo) {
    throw new Error('Receiver mismatch — the payment did not go to the configured address.');
  }

  if (assetT) {
    const assetId = Number(assetT['asset-id']);
    if (assetId !== Number(quote.extra?.asset ?? 0)) {
      throw new Error(`Wrong asset — expected USDC ASA ${quote.extra?.asset ?? 0}.`);
    }
  }

  const amount = Number(assetT?.amount ?? pay?.amount ?? 0);
  const expectedUnits = Math.round(parseFloat(quote.price.replace('$', '')) * 1_000_000);
  if (amount < expectedUnits) {
    throw new Error(`Insufficient payment — expected at least ${expectedUnits} units, received ${amount}.`);
  }

  return { confirmedRound: Number(tx['confirmed-round']) };
}

/**
 * x402 Payment Middleware
 *
 * Intercepts requests to payment-protected endpoints:
 *  - No payment header          → 402 + payment quote
 *  - Payment header + verify    → on-chain check via indexer (default)
 *  - Payment header + demo mode → trusted (X402_VERIFY=demo, for demos/tests)
 */
async function x402Middleware(endpoint: string, c: any) {
  const config = getPaymentConfig();
  const paymentConfig = config[endpoint as keyof typeof config];

  if (!paymentConfig) {
    return null; // No payment required for this endpoint
  }

  const quote = paymentConfig.accepts[0];

  // Check for payment header
  const paymentHeader = c.req.header('Payment-Signature') || c.req.header('X-Payment');

  if (!paymentHeader) {
    // Return 402 Payment Required with a client-ready quote
    return c.json({
      error: 'Payment Required',
      message: `This endpoint requires a payment of ${quote.price} USDC`,
      payment: {
        amount: quote.price,
        amountUsd: parseFloat(quote.price.replace('$', '')),
        network: `algorand-${NETWORK}`,
        receiver: getAvmAddress(),
        asset: 'USDC',
        assetId: quote.extra?.asset ?? 0,
        algodUrl: getAlgodUrl(),
        explorerBase: `https://${NETWORK === 'testnet' ? 'testnet.' : ''}explorer.perawallet.app`,
        description: paymentConfig.description,
      },
    }, 402);
  }

  // Parse the payment signature
  let txId: string;
  try {
    const parsed = JSON.parse(paymentHeader);
    txId = typeof parsed?.txId === 'string' ? parsed.txId : '';
  } catch {
    return c.json({
      error: 'Invalid Payment',
      message: 'The Payment-Signature header must be JSON: {"txId":"<transaction-hash>"}',
    }, 400);
  }
  if (!txId || txId.length < 40) {
    return c.json({
      error: 'Invalid Payment',
      message: 'Missing or malformed txId in the Payment-Signature header.',
    }, 400);
  }

  // Verify the payment
  const mode = (process.env.X402_VERIFY ?? 'indexer').toLowerCase();
  if (mode === 'demo') {
    console.log(`✓ PAYMENT VERIFIED (demo mode — no on-chain check) - ${endpoint} - tx ${txId.slice(0, 12)}…`);
  } else {
    try {
      const { confirmedRound } = await verifyPaymentOnChain(txId, quote);
      c.set('x402-round', confirmedRound);
      c.set('x402-quote', quote);
      console.log(`✓ PAYMENT VERIFIED ON-CHAIN - ${endpoint} - tx ${txId.slice(0, 12)}… - round ${confirmedRound}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not verify the payment.';
      return c.json({
        error: 'Payment Not Verified',
        message,
        payment: {
          amount: quote.price,
          amountUsd: parseFloat(quote.price.replace('$', '')),
          network: `algorand-${NETWORK}`,
          receiver: getAvmAddress(),
          asset: 'USDC',
          assetId: quote.extra?.asset ?? 0,
          algodUrl: getAlgodUrl(),
          explorerBase: `https://${NETWORK === 'testnet' ? 'testnet.' : ''}explorer.perawallet.app`,
          description: paymentConfig.description,
        },
      }, 402);
    }
  }

  return null; // Payment verified, continue to handler
}

// Register payment-protected endpoints
app.get('/weather', async (c) => {
  const middlewareResult = await x402Middleware('GET /weather', c);
  if (middlewareResult) return middlewareResult;
  return handleWeatherRequest(c);
});

app.get('/analytics', async (c) => {
  const middlewareResult = await x402Middleware('GET /analytics', c);
  if (middlewareResult) return middlewareResult;
  return handleAnalyticsRequest(c);
});

app.post('/ai-analysis', async (c) => {
  const middlewareResult = await x402Middleware('POST /ai-analysis', c);
  if (middlewareResult) return middlewareResult;
  return handleAiAnalysisRequest(c);
});

app.get('/creator-content/:id', async (c) => {
  const middlewareResult = await x402Middleware('GET /creator-content/:id', c);
  if (middlewareResult) return middlewareResult;
  return handleCreatorContentRequest(c);
});

app.post('/generate-deck', async (c) => {
  const middlewareResult = await x402Middleware('POST /generate-deck', c);
  if (middlewareResult) return middlewareResult;
  return handleDeckGenerationRequest(c);
});

// 404 handler
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    availableEndpoints: Object.keys(getPaymentConfig()),
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Server Error:', err);
  return c.json({
    error: 'Internal Server Error',
    message: err.message,
  }, 500);
});

// Start server only when run directly (`npm run dev` / `npm start`).
// Importing this module (e.g. from test.ts) does NOT bind the port.
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  console.log(`
🚀 Deckify AI x402 API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Port: ${PORT}
Network: ${NETWORK}
Verification: ${(process.env.X402_VERIFY ?? 'indexer').toLowerCase() === 'demo' ? 'demo (no on-chain check)' : 'on-chain (Algorand indexer)'}
Address: ${getAvmAddress() || '(not configured — set AVM_ADDRESS in .env)'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Endpoints:
${Object.keys(getPaymentConfig()).map(ep => `  ${ep}`).join('\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  serve({
    fetch: app.fetch,
    port: PORT,
  });
}

export default app;
