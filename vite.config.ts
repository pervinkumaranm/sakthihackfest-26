import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from .env into process.env for local dev server
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [
      react(),
      {
        name: 'local-vercel-api-dev-server',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const isRegister = req.url === '/api/register' && req.method === 'POST'
            const isAdmin = req.url === '/api/admin' && req.method === 'POST'
            const isTimer = req.url === '/api/timer' || req.url?.startsWith('/api/timer')
            const isWinners = req.url === '/api/winners' || req.url?.startsWith('/api/winners')

            if (isRegister || isAdmin || isTimer || isWinners) {
              // Reload environment variables from .env on every request
              const currentEnv = loadEnv(mode, process.cwd(), '')
              Object.assign(process.env, currentEnv)

              let bodyStr = ''
              req.on('data', chunk => {
                bodyStr += chunk
              })
              req.on('end', async () => {
                try {
                  const body = bodyStr ? JSON.parse(bodyStr) : {}
                  const targetModule = isRegister
                    ? '/api/register.ts'
                    : isAdmin
                    ? '/api/admin.ts'
                    : isTimer
                    ? '/api/timer.ts'
                    : '/api/winners.ts'
                  
                  // Dynamically load the TypeScript API function using Vite's SSR runtime
                  const apiModule = await server.ssrLoadModule(targetModule)
                  const handler = apiModule.default

                  const nodeRes = {
                    statusCode: 200,
                    setHeader(key: string, val: string) {
                      res.setHeader(key, val)
                      return this
                    },
                    status(code: number) {
                      res.statusCode = code
                      return this
                    },
                    json(data: any) {
                      res.setHeader('Content-Type', 'application/json')
                      res.end(JSON.stringify(data))
                    },
                    end(data?: any) {
                      res.end(data)
                    },
                  }

                  const nodeReq = {
                    method: 'POST',
                    headers: req.headers,
                    body: body,
                  }

                  await handler(nodeReq, nodeRes)
                } catch (err: any) {
                  const ep = isRegister ? '/api/register' : '/api/admin'
                  console.error(`[Local Dev ${ep} error]:`, err)
                  res.setHeader('Content-Type', 'application/json')
                  res.statusCode = 500
                  res.end(
                    JSON.stringify({
                      success: false,
                      stage: 'dev_server',
                      message: err.message || `Error processing ${ep} on dev server.`,
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
