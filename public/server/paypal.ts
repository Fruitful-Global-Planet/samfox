/**
 * WARNING: CRITICAL PayPal Integration Code
 * DO NOT MODIFY this file without proper review and approval.
 * This module handles sensitive payment processing operations.
 * Any changes to this code must be tested thoroughly in sandbox
 * environment before deployment to production.
 */

// PayPal API Configuration
const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';

interface PayPalAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PayPalOrder {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

interface PayPalCaptureResult {
  id: string;
  status: string;
  purchase_units: Array<{
    reference_id: string;
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
      }>;
    };
  }>;
}

/**
 * Generates a PayPal access token for API authentication.
 * @returns Promise containing the access token response
 */
export async function generateAccessToken(): Promise<PayPalAccessToken> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`Failed to generate access token: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Creates a PayPal order for processing payment.
 * @param amount - The payment amount
 * @param currency - The currency code (default: USD)
 * @returns Promise containing the created order details
 */
export async function createOrder(amount: string, currency: string = 'USD'): Promise<PayPalOrder> {
  const { access_token } = await generateAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount,
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create order: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Captures payment for an approved PayPal order.
 * @param orderId - The PayPal order ID to capture
 * @returns Promise containing the capture result
 */
export async function capturePayment(orderId: string): Promise<PayPalCaptureResult> {
  const { access_token } = await generateAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to capture payment: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Retrieves details of an existing PayPal order.
 * @param orderId - The PayPal order ID
 * @returns Promise containing the order details
 */
export async function getOrderDetails(orderId: string): Promise<PayPalOrder> {
  const { access_token } = await generateAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get order details: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Verifies a webhook signature from PayPal.
 * @param webhookId - The webhook ID from PayPal
 * @param eventBody - The raw webhook event body
 * @param headers - The webhook request headers
 * @returns Promise containing verification status
 */
export async function verifyWebhookSignature(
  webhookId: string,
  eventBody: string,
  headers: Record<string, string>
): Promise<{ verification_status: string }> {
  const { access_token } = await generateAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: webhookId,
      webhook_event: JSON.parse(eventBody),
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to verify webhook signature: ${response.statusText}`);
  }

  return response.json();
}
