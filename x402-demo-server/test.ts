/**
 * 🧪 x402 Demo Server — End-to-end test
 *
 * Verifies the payment-protected flow without a browser:
 *   1. Unpaid request        → 402 Payment Required (+ payment quote)
 *   2. Request with payment  → 200 + data
 *   3. Deck generation       → unpaid 402, paid 200
 *   4. Real verification     → a bogus txId is rejected by the indexer
 *   5. Health check / 404
 *
 * Run: npm test
 */

// The happy-path tests use demo verification (no real wallet). The final
// test flips to real indexer verification and expects a bogus tx to fail.
process.env.X402_VERIFY = 'demo';

export {}; // mark as an ES module so top-level await is allowed

const { default: app } = await import('./index.js');

const check = (name: string, condition: boolean, extra = '') => {
  if (!condition) throw new Error(`✗ ${name} ${extra}`);
  console.log(`  ✓ ${name}${extra ? ` — ${extra}` : ''}`);
};

const run = async () => {
  console.log('\n🧪 x402 demo server tests\n');

  // 1. Unpaid request → 402 with payment quote
  const unpaid = await app.request('/weather?location=new york');
  check('unpaid /weather returns 402', unpaid.status === 402, `status ${unpaid.status}`);
  const unpaidBody = (await unpaid.json()) as {
    payment?: { amount?: string; amountUsd?: number; assetId?: number; receiver?: string };
  };
  check(
    '402 body includes payment quote',
    Boolean(unpaidBody.payment?.amount && unpaidBody.payment?.assetId !== undefined),
    `amount ${unpaidBody.payment?.amount} · assetId ${unpaidBody.payment?.assetId}`,
  );

  // 2. Paid request → 200 with data
  const paid = await app.request('/weather?location=london', {
    headers: {
      'Payment-Signature': JSON.stringify({ txId: 'demo-tx-id-0000000000000000000000000000000000000000' }),
    },
  });
  check('paid /weather returns 200', paid.status === 200, `status ${paid.status}`);
  const paidBody = (await paid.json()) as { data?: { city?: string } };
  check('paid response includes weather data', Boolean(paidBody.data?.city), `city ${paidBody.data?.city}`);

  // 3. Paid POST /ai-analysis → 200
  const analysis = await app.request('/ai-analysis', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Payment-Signature': JSON.stringify({ txId: 'demo-tx-ai-00000000000000000000000000000000000000000' }),
    },
    body: JSON.stringify({ repository: 'marotipatre/x402-Project', type: 'project' }),
  });
  check('paid POST /ai-analysis returns 200', analysis.status === 200, `status ${analysis.status}`);

  // 4. Unpaid POST /generate-deck → 402 with quote
  const genUnpaid = await app.request('/generate-deck', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repository: 'marotipatre/x402-Project' }),
  });
  check('unpaid POST /generate-deck returns 402', genUnpaid.status === 402, `status ${genUnpaid.status}`);
  const genQuote = (await genUnpaid.json()) as { payment?: { amount?: string; asset?: string } };
  check('generate-deck quote is in USDC', genQuote.payment?.asset === 'USDC', `amount ${genQuote.payment?.amount}`);

  // 5. Paid POST /generate-deck → 200 with generation receipt
  const genPaid = await app.request('/generate-deck', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Payment-Signature': JSON.stringify({ txId: 'demo-deck-000000000000000000000000000000000000000000' }),
    },
    body: JSON.stringify({ repository: 'marotipatre/x402-Project', deckId: 'demo-deck-1' }),
  });
  check('paid POST /generate-deck returns 200', genPaid.status === 200, `status ${genPaid.status}`);
  const genBody = (await genPaid.json()) as {
    payment?: { status?: string; cost?: string };
    generation?: { projectName?: string; slides?: number };
  };
  check('generation receipt is verified', genBody.payment?.status === 'verified', `cost ${genBody.payment?.cost}`);
  check('generation includes project analysis', genBody.generation?.projectName === 'x402-Project', `slides ${genBody.generation?.slides}`);

  // 6. Real indexer verification rejects a bogus txId
  process.env.X402_VERIFY = 'indexer';
  const bogus = await app.request('/weather', {
    headers: {
      'Payment-Signature': JSON.stringify({ txId: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' }),
    },
  });
  process.env.X402_VERIFY = 'demo';
  check('bogus txId rejected by on-chain verification', bogus.status !== 200, `status ${bogus.status}`);

  // 7. Health check
  const health = await app.request('/');
  check('GET / health check returns 200', health.status === 200, `status ${health.status}`);

  // 8. Unknown endpoint → 404
  const missing = await app.request('/nope');
  check('unknown endpoint returns 404', missing.status === 404, `status ${missing.status}`);

  console.log('\n✅ All x402 server tests passed\n');
  process.exit(0);
};

run().catch((err) => {
  console.error('\n❌ Test failed:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
