/**
 * SAKTHI HACKFEST 2K26 — Live Winner Announcement Serverless Endpoint
 * Endpoint: /api/winners
 */

let globalWinnerState: any = {
  stage: 'NOT_STARTED',
  firstPlace: null,
  secondPlace: null,
  thirdPlace: null,
  lastUpdated: Date.now(),
};

export const config = {
  maxDuration: 15,
};

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: return current state
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      state: globalWinnerState,
    });
  }

  // POST: update state
  if (req.method === 'POST') {
    const body = req.body || {};
    if (body.action === 'set_state' && body.state) {
      globalWinnerState = {
        ...body.state,
        lastUpdated: Date.now(),
      };
      return res.status(200).json({
        success: true,
        message: 'Winner announcement state updated.',
        state: globalWinnerState,
      });
    }

    return res.status(200).json({
      success: true,
      state: globalWinnerState,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
