/**
 * SAKTHI HACKFEST 2K26 — Live Stage Timer Serverless Endpoint
 * Endpoint: /api/timer
 */

let globalTimerState: any = {
  status: 'IDLE',
  totalDurationSeconds: 86400, // 24 Hours
  remainingSeconds: 86400,
  announcement: 'WELCOME TO SAKTHI HACKFEST 2K26 · BUILD. BREAK. INNOVATE.',
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
    // If running, dynamically calculate remaining
    let currentRemaining = globalTimerState.remainingSeconds;
    if (globalTimerState.status === 'RUNNING' && globalTimerState.targetEndTime) {
      const now = Date.now();
      currentRemaining = Math.max(0, Math.round((globalTimerState.targetEndTime - now) / 1000));
      if (currentRemaining <= 0) {
        globalTimerState.status = 'ENDED';
      }
    }

    return res.status(200).json({
      success: true,
      state: {
        ...globalTimerState,
        remainingSeconds: currentRemaining,
      },
    });
  }

  // POST: update state
  if (req.method === 'POST') {
    const body = req.body || {};
    if (body.action === 'set_state' && body.state) {
      globalTimerState = {
        ...body.state,
        lastUpdated: Date.now(),
      };
      return res.status(200).json({
        success: true,
        message: 'Timer state updated.',
        state: globalTimerState,
      });
    }

    return res.status(200).json({
      success: true,
      state: globalTimerState,
    });
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
