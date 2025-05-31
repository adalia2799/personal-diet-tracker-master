// pages/api/n8n/onboarding.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, created_at, context } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const n8nWebhookUrl = process.env.N8N_ONBOARDING_WEBHOOK_URL;
    if (!n8nWebhookUrl) {
      console.error('N8N_ONBOARDING_WEBHOOK_URL is not set in environment variables!');
      return res.status(500).json({ error: 'Server configuration error: n8n webhook URL missing.' });
    }

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id,
        created_at: created_at || new Date().toISOString(),
        context: context || {
          platform: 'web',
          source: 'onboarding'
        }
      }),
    });

    // Check if the n8n webhook call was successful
    if (!response.ok) {
      const errorData = await response.text(); // Get raw error response from n8n
      console.error(`Error from n8n onboarding webhook (Status: ${response.status}):`, errorData);
      throw new Error(`n8n onboarding webhook failed with status: ${response.status}`);
    }

    // Parse n8n's response and send it back to the client
    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(data);

  } catch (error: any) {
    console.error('Error in onboarding API:', error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
