# x402 Demo Server — Payment-Protected API (Deckify AI)

A Hono + TypeScript API server that protects endpoints behind **Algorand x402**
payments (USDC microtransactions). Clients pay per request — no subscriptions,
no Stripe, no cards. This server is what the Deckify AI frontend talks to for
usage-based AI compute.

```
BROWSER                                    BACKEND                    FACILITATOR
────────                                    ────────                   ──────────
React (localhost:5173)      ──HTTP──▶       Hono (localhost:4021)  ──▶  GoPlausible
Connect wallet (Pera/Defly)                x402 payment middleware      verify + settle
  │                                          │
  ├─ Request ──────────────────────────────▶ │  (no payment → 402 + quote)
  │ ◀── 402 Payment Required ◀────────────── │
  ├─ Wallet signs transaction ──────────────▶ │
  │ ◀── 200 + data ◀──────────────────────── │
```

## Structure

```
x402-demo-server/
├── index.ts                 ⭐ Main server — Hono + x402 middleware (listen on :4021)
├── endpoints.config.ts      📝 Define your payment-protected routes here
├── handlers/
│   ├── weather.ts           📦 Weather data          — $0.005 USDC
│   ├── analytics.ts         📦 Analytics metrics     — $0.01  USDC
│   ├── ai-analysis.ts       📦 AI project analysis   — $0.001 USDC
│   └── creator-content.ts   📦 Premium content       — $0.05  USDC
├── test.ts                  🧪 End-to-end payment-flow tests
├── package.json
└── tsconfig.json
```

## Setup

```bash
cd x402-demo-server
npm install

# Configure your receiver address (see "Environment" below)
# Create a `.env` file with your values (copy from the table below).
npm run dev          # starts on http://localhost:4021
```

### Environment variables

| Variable      | Description                                                              | Example |
| ------------- | ------------------------------------------------------------------------ | ------- |
| `AVM_ADDRESS` | Your Algorand address that receives the USDC payments.                   | `GD64YI…BHU5A` |
| `AVM_NETWORK` | `testnet` (default) or `mainnet`                                         | `testnet` |
| `PORT`        | Server port (defaults to `4021`)                                         | `4021` |

Create a `.env` file in this folder:

```bash
AVM_ADDRESS=YOUR_ALGORAND_ADDRESS_HERE
AVM_NETWORK=testnet
PORT=4021
```

> **TestNet funding:** use the Algorand dispenser
> (dispenser.testnet.aws.algodev.network) to fund your receiver address with
> TestNet ALGO, then opt in to TestNet USDC (ASA `10458941`) so payments can
> settle.

## The x402 flow (how it works)

1. **Request** — the frontend calls a protected endpoint, e.g. `GET /weather`.
2. **402 + quote** — the server answers `402 Payment Required` with a payment
   quote: `{ payment: { amount, network, receiver, description } }`.
3. **Pay** — the user's wallet (Pera/Defly) builds and signs a USDC payment
   transaction for the quoted amount to the receiver address.
4. **Retry** — the frontend retries the request with the signed payment
   attached (`Payment-Signature` header).
5. **Data** — the server validates the payment and returns the data.

## Test the flow

Automated (in-process, no browser needed):

```bash
npm test
```

Expect:

```
🧪 x402 demo server tests

  ✓ unpaid /weather returns 402 — status 402
  ✓ 402 body includes payment details — amount $0.005
  ✓ paid /weather returns 200 — status 200
  ✓ paid response includes weather data — city London
  ✓ paid POST /ai-analysis returns 200 — status 200
  ✓ GET / health check returns 200 — status 200
  ✓ unknown endpoint returns 404 — status 404

✅ All x402 server tests passed
```

Manual (curl):

```bash
# 1. Unpaid → 402 with payment quote
curl -s http://localhost:4021/weather?location=new%20york

# 2. Paid → 200 with data (demo signature; a real client sends the wallet's
#    signed transaction reference after on-chain verification)
curl -s http://localhost:4021/weather?location=london \
  -H "Payment-Signature: {\"txId\":\"demo-tx-id\",\"amount\":0.005}"
```

From the Deckify AI frontend (localhost:5173): connect a wallet → request a
premium deck → approve the USDC payment → the server verifies and returns the
generated deck data.

## Production hardening

- Replace the demo payment check in `index.ts` with real on-chain
  verification: look the `txId` up on the Algorand indexer and confirm the
  sender paid the quoted amount to your receiver address.
- Restrict CORS `origin` to your frontend domain.
- Store `AVM_ADDRESS` in the deployment's secret store, never in the repo.
