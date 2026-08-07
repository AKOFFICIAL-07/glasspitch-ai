/**
 * 📦 Weather Handler
 *
 * Example handler for real-time weather data.
 * This is a basic example showing how to implement a payment-protected endpoint.
 */

import type { Context } from 'hono';

// Mock weather data (in production, call a real weather API)
const weatherData: Record<string, any> = {
  'new york': {
    city: 'New York',
    temperature: 72,
    condition: 'Sunny',
    humidity: 45,
    wind: '8 mph',
    forecast: 'Clear skies expected throughout the day',
  },
  'london': {
    city: 'London',
    temperature: 61,
    condition: 'Cloudy',
    humidity: 78,
    wind: '12 mph',
    forecast: 'Light rain expected in the evening',
  },
  'tokyo': {
    city: 'Tokyo',
    temperature: 68,
    condition: 'Partly Cloudy',
    humidity: 62,
    wind: '6 mph',
    forecast: 'Mild weather with occasional sunshine',
  },
};

export function handleWeatherRequest(c: Context) {
  try {
    console.log('✓ PAYMENT VERIFIED - GET /weather handler executing');

    // Get location from query params
    const location = c.req.query('location')?.toLowerCase() || 'new york';

    // Look up weather data (mock)
    const data = weatherData[location] || {
      city: location.charAt(0).toUpperCase() + location.slice(1),
      temperature: Math.floor(Math.random() * 40) + 50,
      condition: ['Sunny', 'Cloudy', 'Rainy', 'Windy'][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 50) + 30,
      wind: `${Math.floor(Math.random() * 15) + 3} mph`,
      forecast: 'Weather data retrieved successfully',
    };

    return c.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      source: 'Deckify AI Weather API',
      cost: '$0.005 USDC',
    });
  } catch (error) {
    console.error('Weather handler error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch weather data',
    }, 500);
  }
}
