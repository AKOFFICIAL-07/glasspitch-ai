/**
 * 🧪 x402 Demo Server — End-to-end test
 *
 * Verifies the payment-protected flow without a browser:
 *   1. Unpaid request        → 402 Payment Required (+ payment details)
 *   2. Request with payment  → 200 + data
 *   3. Health check          → 200
 *   4. Unknown endpoint      → 404
 *
 * Run: npm test
 */
import app from './index.js';

const check = (name: string, condition: boolean, extra = '') => {
  if (!condition) throw new Error(`✗ ${name} ${extra}`);
  console.log(`  ✓ ${name}${extra ? ` — ${extra}` : ''}`);
};

const run = async () => {
  console.log('\n🧪 x402 demo server tests\n');

  // 1. Unpaid request → 402 with payment details
  const unpaid = await app.request('/weather?location=new york');
  check('unpaid /weather returns 402', unpaid.status === 402, `status ${unpaid.status}`);
  const unpaidBody = (await unpaid.json()) as { payment?: { amount?: string; receiver?: string } };
  check(
    '402 body includes payment details',
    Boolean(unpaidBody.payment?.amount && unpaidBody.payment?.receiver !== undefined),
    `amount ${unpaidBody.payment?.amount}`,
  );

  // 2. Paid request → 200 with data
  const paid = await app.request('/weather?location=london', {
    headers: {
      'Payment-Signature': JSON.stringify({ txId: 'demo-tx-id', amount: 0.005 }),
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
      'Payment-Signature': JSON.stringify({ txId: 'demo-tx-ai', amount: 0.001 }),
    },
    body: JSON.stringify({ repository: 'marotipatre/x402-Project', type: 'project' }),
  });
  check('paid POST /ai-analysis returns 200', analysis.status === 200, `status ${analysis.status}`);

  // 4. Health check
  const health = await app.request('/');
  check('GET / health check returns 200', health.status === 200, `status ${health.status}`);

  // 5. Unknown endpoint → 404
  const missing = await app.request('/nope');
  check('unknown endpoint returns 404', missing.status === 404, `status ${missing.status}`);

  console.log('\n✅ All x402 server tests passed\n');
  process.exit(0);
};

run().catch((err) => {
  console.error('\n❌ Test failed:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
