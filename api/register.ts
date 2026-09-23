/**
 * Vercel Serverless Function — Registration Proxy
 * Endpoint: POST /api/register
 *
 * Forwards registration submissions securely server-to-server to Google Apps Script.
 * Bypasses browser ISP blocks, connection resets, and CORS issues.
 */

export const config = {
  maxDuration: 60,
};

const DEFAULT_GAS_URL =
  'https://script.google.com/macros/s/AKfycby1wwXdxr6hgymC-Xa8rVvJv0vsEe4UeLMG2O6A5bklfVCXpjHkAm3_5AjCDEckZF5e1g/exec';

async function forwardToAppsScript(payload: any) {
  const gasUrl = process.env.GAS_WEB_APP_URL || DEFAULT_GAS_URL;

  if (!gasUrl) {
    return {
      status: 500,
      body: {
        success: false,
        stage: 'config',
        message: 'GAS_WEB_APP_URL is not configured.',
      },
    };
  }

  console.log('Forwarding registration to GAS_WEB_APP_URL:', gasUrl);

  const requestPayload = {
    action: 'SUBMIT_REGISTRATION',
    data: payload.data || payload,
    ...(payload.data || payload),
  };

  try {
    const gasResponse = await fetch(gasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(requestPayload),
    });

    const gasText = await gasResponse.text();

    console.log('GAS HTTP STATUS:', gasResponse.status);
    console.log('GAS RESPONSE:', gasText);

    let gasResult: any;
    try {
      gasResult = JSON.parse(gasText);
    } catch (parseError) {
      console.error('Invalid Apps Script response:', gasText);
      return {
        status: 502,
        body: {
          success: false,
          stage: 'gas_response',
          message: 'Google Apps Script returned an invalid response.',
        },
      };
    }

    return {
      status: gasResult.success ? 200 : 400,
      body: gasResult,
    };
  } catch (error: any) {
    console.error('GAS connection error in Vercel function:', error);
    return {
      status: 502,
      body: {
        success: false,
        stage: 'gas_connection',
        message: error.message || 'Unable to connect to Google Apps Script backend.',
      },
    };
  }
}

export default async function handler(req: any, res?: any) {
  // Support Web standard Request / Edge runtime
  if (req instanceof Request || (!res && typeof req.json === 'function')) {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, message: 'Method Not Allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let payload: any;
    try {
      payload = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, message: 'Malformed JSON payload' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await forwardToAppsScript(payload);
    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Support Node.js runtime (Vercel Node.js Serverless Function)
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const result = await forwardToAppsScript(payload);
    return res.status(result.status).json(result.body);
  } catch (err: any) {
    return res.status(400).json({ success: false, message: 'Invalid request body' });
  }
}
