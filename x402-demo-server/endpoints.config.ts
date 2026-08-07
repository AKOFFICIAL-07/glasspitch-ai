/**
 * 📝 x402 Payment Configuration
 *
 * Define your payment-protected endpoints here.
 * Each endpoint specifies:
 * - Price in USDC
 * - Network (testnet/mainnet)
 * - Receiver address
 * - Description of what users pay for
 */

import dotenv from 'dotenv';

dotenv.config();

// Algorand network constants
const ALGORAND_TESTNET_CAIP2 = 'algorand:testnet';
const ALGORAND_MAINNET_CAIP2 = 'algorand:mainnet';

// USDC ASA IDs
const USDC_TESTNET_ASA_ID = 10458941; // Algorand TestNet USDC
const USDC_MAINNET_ASA_ID = 31566704; // Algorand MainNet USDC

// Get wallet address from environment
export function getAvmAddress(): string {
  return process.env.AVM_ADDRESS || '';
}

// Get network from environment
function getNetwork(): string {
  return process.env.AVM_NETWORK || 'testnet';
}

// Get USDC ASA ID based on network
function getUsdcAssetId(): number {
  return getNetwork() === 'mainnet' ? USDC_MAINNET_ASA_ID : USDC_TESTNET_ASA_ID;
}

// Get CAIP2 based on network
function getCaip2(): string {
  return getNetwork() === 'mainnet' ? ALGORAND_MAINNET_CAIP2 : ALGORAND_TESTNET_CAIP2;
}

/**
 * Payment configuration for all endpoints
 *
 * Format: 'METHOD /path': { accepts: [...], description: '...' }
 */
export function getPaymentConfig() {
  const avmAddress = getAvmAddress();
  const caip2 = getCaip2();
  const usdcAssetId = getUsdcAssetId();

  return {
    // Weather data endpoint - $0.005 per request
    'GET /weather': {
      accepts: [
        {
          scheme: 'exact',
          price: '$0.005',
          network: caip2,
          payTo: avmAddress,
          extra: { asset: usdcAssetId },
        },
      ],
      description: 'Real-time weather data for any location',
    },

    // Analytics endpoint - $0.01 per report
    'GET /analytics': {
      accepts: [
        {
          scheme: 'exact',
          price: '$0.01',
          network: caip2,
          payTo: avmAddress,
          extra: { asset: usdcAssetId },
        },
      ],
      description: 'User analytics and performance metrics',
    },

    // AI analysis endpoint - $0.001 per request
    'POST /ai-analysis': {
      accepts: [
        {
          scheme: 'exact',
          price: '$0.001',
          network: caip2,
          payTo: avmAddress,
          extra: { asset: usdcAssetId },
        },
      ],
      description: 'AI-powered code and project analysis',
    },

    // Creator content endpoint - $0.05 per unlock
    'GET /creator-content/:id': {
      accepts: [
        {
          scheme: 'exact',
          price: '$0.05',
          network: caip2,
          payTo: avmAddress,
          extra: { asset: usdcAssetId },
        },
      ],
      description: 'Exclusive creator content and premium resources',
    },
  };
}

/**
 * Get payment details for a specific endpoint
 */
export function getEndpointPayment(endpoint: string) {
  const config = getPaymentConfig();
  return config[endpoint as keyof typeof config] || null;
}

/**
 * Calculate total cost for multiple endpoint calls
 */
export function calculateTotalCost(endpoints: string[]): number {
  const config = getPaymentConfig();
  let total = 0;

  for (const endpoint of endpoints) {
    const payment = config[endpoint as keyof typeof config];
    if (payment) {
      const priceStr = payment.accepts[0].price.replace('$', '');
      total += parseFloat(priceStr);
    }
  }

  return total;
}
