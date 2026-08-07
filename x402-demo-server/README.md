# x402 Demo Server — Payment-Protected API (Deckify AI)

A Hono + TypeScript API server that protects endpoints behind **Algorand x402**
payments (USDC microtransactions). Clients pay per request — no subscriptions,
no Stripe, no cards. This server is what the Deckify AI frontend calls for
payment-protected premium deck generation.

```
BROWSER                                    BACKEND                    FACILITATOR
────────                                    ────────                   ──────────
React (localhost:5173)      ──HTTP──▶       Hono (localhost:4021)  ──▶  GoPlausible
Connect wallet (Pera/Defly)                x402 payment middleware      verify + settle
  │                                          │
  ├─ POST /generate-deck ──────────────────▶ │  (no payment → 402 + USDC quote)
  │ ◀── 402 Payment Required ◀────────────── │
  ├─ Wallet signs USDC payment ────────────▶ │
  ├─ retry + Payment-Signature header ─────▶ │  on-chain verify (indexer)
  │ ◀── 200 + generation receipt ◀────────── │
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
│   ├── creator-content.ts   📦 Premium content       — $0.05  USDC
│   └── deck-generation.ts   🎯 AI pitch deck generation — $1.00 USDC (Deckify AI)
├── test.ts                  🧪 End-to-end payment-flow tests
├── package.json
└── tsconfig.json
```

## Setup

```bash
cd x402-demo-server
npm install

# Create a `.env` file (see table below) with your receiver address.
npm run dev          # starts on http://localhost:4021
```

### Environment variables

| Variable          | Description                                                                 | Default |
| ----------------- | --------------------------------------------------------------------------- | ------- |
| `AVM_ADDRESS`     | Your Algorand address that receives the USDC payments.                      | — (required) |
| `AVM_NETWORK`     | `testnet` or `mainnet`                                                      | `testnet` |
| `AVM_INDEXER_URL` | Algorand indexer used for on-chain verification                             | AlgoNode for the network |
| `PORT`            | Server port                                                                 | `4021` |
| `DECK_PRICE_USD`  | Price of `POST /generate-deck` in USDC                                      | `1.00` |
| `X402_VERIFY`     | `indexer` = real on-chain verification · `demo` = trust header (tests/demos) | `indexer` |

```bash
# .env
AVM_ADDRESS=YOUR_ALGORAND_ADDRESS_HERE
AVM_NETWORK=testnet
PORT=4021
```

> **TestNet funding:** use the Algorand dispenser
> (dispenser.testnet.aws.algodev.network) to fund your receiver address with
> TestNet ALGO, then opt in to TestNet USDC (ASA `10458941`) so payments can
> settle. On MainNet USDC is ASA `31566704`.

## Payment-protected endpoints

| Endpoint                  | Price    | Description                                     |
| ------------------------- | -------- | ----------------------------------------------- |
| `GET /weather`            | $0.005   | Real-time weather data                          |
| `GET /analytics`          | $0.01    | User analytics and performance metrics          |
| `POST /ai-analysis`       | $0.001   | AI-powered code and project analysis            |
| `GET /creator-content/:id`| $0.05    | Exclusive creator content                       |
| `POST /generate-deck`     | $1.00    | **AI pitch deck generation (Deckify AI premium)** |

## The x402 flow (how it works)

1. **Request** — the frontend calls a protected endpoint, e.g. `POST /generate-deck`.
2. **402 + quote** — the server answers `402 Payment Required` with a
   client-ready quote: `{ payment: { amount, amountUsd, network, receiver,
   asset, assetId, algodUrl, explorerBase, description } }`.
3. **Pay** — the user's wallet (Pera/Defly) builds and signs a **USDC asset
   transfer** for the quoted amount to the receiver address.
4. **Retry** — the frontend retries with `Payment-Signature: {"txId":"..."}`.
5. **Verify + data** — the server verifies the transaction **on-chain via the
   Algorand indexer** (confirmed, correct receiver, USDC asset, sufficient
   amount) and returns the generation receipt. Set `X402_VERIFY=demo` to trust
   the header instead (quick demos / CI).

## Test the flow

Automated (in-process, no browser needed):

```bash
npm test
```

Expect all checks to pass, including a real-indexer rejection of a bogus txId:

```
🧪 x402 demo server tests

  ✓ unpaid /weather returns 402 — status 402
  ✓ 402 body includes payment quote — amount $0.005 · assetId 10458941
  ✓ paid /weather returns 200 — status 200
  ✓ paid response includes weather data — city London
  ✓ paid POST /ai-analysis returns 200 — status 200
  ✓ unpaid POST /generate-deck returns 402 — status 402
  ✓ generate-deck quote is in USDC — amount $1.00
  ✓ paid POST /generate-deck returns 200 — status 200
  ✓ generation receipt is verified — cost $1.00 USDC
  ✓ generation includes project analysis — slides 13
  ✓ bogus txId rejected by on-chain verification — status 402
  ✓ GET / health check returns 200 — status 200
  ✓ unknown endpoint returns 404 — status 404

✅ All x402 server tests passed
```

Manual (curl):

```bash
# 1. Unpaid → 402 with payment quote
curl -s -X POST http://localhost:4021/generate-deck \
  -H "Content-Type: application/json" \
  -d '{"repository":"marotipatre/x402-Project"}'

# 2. Paid → 200 (demo mode: X402_VERIFY=demo; a real client sends the txId of
#    the wallet-signed USDC transfer after on-chain confirmation)
curl -s -X POST http://localhost:4021/generate-deck \
  -H "Content-Type: application/json" \
  -H "Payment-Signature: {\"txId\":\"REAL_TRANSACTION_HASH\"}" \
  -d '{"repository":"marotipatre/x402-Project"}'
```

## Frontend wiring (Deckify AI)

The DeckView premium gate (`X402Gate`) now drives the whole flow through this
server instead of the old Convex payment mutations:

1. Opens → health-checks `GET /` on the server.
2. "Request payment" → `POST /generate-deck` → stores the **402 quote**.
3. Wallet connects → pays the quoted **USDC** amount (asset transfer).
4. Retries `POST /generate-deck` with `Payment-Signature` → server verifies
   on-chain → returns the receipt → the deck unlocks.

Point the frontend at your server with `VITE_X402_SERVER_URL`
(default `http://localhost:4021`).

## Deploy (so the gate works without localhost)

The server is a long-running Node process (`@hono/node-server`), so it needs a
container host — not a serverless platform. A multi-stage `Dockerfile` compiles
with `tsc` and runs `node dist/index.js` (no `tsx` at boot, small image).

```bash
# Build + run the container locally to verify
cd x402-demo-server
docker build -t deckify-x402 .
docker run --rm -p 4021:4021 --env-file .env deckify-x402
curl http://localhost:4021/    # → health check 200
```

### Option A — Fly.io (recommended, always-on free tier)

`fly.toml` is included in this folder.

```bash
cd x402-demo-server
fly launch --dockerfile Dockerfile --name deckify-x402 --no-deploy
fly secrets set AVM_ADDRESS=YOUR_ALGORAND_ADDRESS AVM_NETWORK=testnet DECK_PRICE_USD=1.00
fly deploy
curl https://deckify-x402.fly.dev/   # → health check 200
```

### Option B — Render

`render.yaml` (Blueprint) is included. In the dashboard: **New → Web Service** →
connect your repo → root `x402-demo-server` → **Environment: Docker** → set env
vars (`AVM_ADDRESS` required) → deploy. Render serves `https://<name>.onrender.com`.
Note: free instances sleep after 15 min idle and cold-start on the next request.

### Wire the frontend

Set the **`VITE_X402_SERVER_URL`** key in the Freebuff Keys tab to your deployed
URL (e.g. `https://deckify-x402.fly.dev`). The DeckView gate uses it for quotes
and verification; without it, the gate falls back to `http://localhost:4021`.

## Production hardening

- `X402_VERIFY=indexer` (default) already verifies every payment on-chain via
  the Algorand indexer: confirmed round, receiver, USDC asset, and amount.
- Restrict CORS `origin` to your frontend domain.
- Store `AVM_ADDRESS` in the deployment's secret store, never in the repo.
