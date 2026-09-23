import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const gasUrl =
    env.GAS_WEB_APP_URL ||
    'https://script.google.com/macros/s/AKfycby1wwXdxr6hgymC-Xa8rVvJv0vsEe4UeLMG2O6A5bklfVCXpjHkAm3_5AjCDEckZF5e1g/exec'

  return {
    plugins: [
      react(),
      {
        name: 'local-vercel-api-dev-server',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/register' && req.method === 'POST') {
              let bodyStr = ''
              req.on('data', chunk => {
                bodyStr += chunk
              })
              req.on('end', async () => {
                try {
                  const body = JSON.parse(bodyStr)
                  const requestPayload = {
                    action: 'SUBMIT_REGISTRATION',
                    data: body.data || body,
                    ...(body.data || body),
                  }
                  console.log('[Local Dev Serverless] POST /api/register -> Apps Script')
                  
                  // Use manual redirect to inspect the Google Apps Script response
                  const gasRes = await fetch(gasUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(requestPayload),
                    redirect: 'manual',
                  })

                  console.log('[Local Dev Serverless] Apps Script HTTP Status:', gasRes.status)

                  if (gasRes.status === 302) {
                    const redirectUrl = gasRes.headers.get('location')
                    if (redirectUrl) {
                      try {
                        const followRes = await fetch(redirectUrl)
                        const text = await followRes.text()
                        res.setHeader('Content-Type', 'application/json')
                        res.statusCode = followRes.ok ? 200 : 502
                        res.end(text)
                        return
                      } catch (followErr: any) {
                        console.error(
                          '[Local Dev Serverless Error] Google Apps Script responded with 302, but your local ISP blocked reading the response (ECONNRESET):',
                          followErr.message
                        )
                        res.setHeader('Content-Type', 'application/json')
                        res.statusCode = 502
                        res.end(
                          JSON.stringify({
                            success: false,
                            stage: 'gas_connection',
                            message: 'Local network connection reset while reading Google Apps Script response. Please deploy to Vercel and verify Google Apps Script authorization.',
                          })
                        )
                        return
                      }
                    }
                  }

                  const text = await gasRes.text()
                  res.setHeader('Content-Type', 'application/json')
                  res.statusCode = gasRes.ok ? 200 : 502
                  res.end(text)
                } catch (err: any) {
                  console.error('[Local Dev Serverless Error]:', err)
                  res.setHeader('Content-Type', 'application/json')
                  res.statusCode = 502
                  res.end(
                    JSON.stringify({
                      success: false,
                      stage: 'gas_connection',
                      message: err.message || 'Unable to connect to registration server.',
                    })
                  )
                }
              })
            } else {
              next()
            }
          })
        },
      },
    ],
  }
})
