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
            if (req.url === '/api/register' && req.method === 'POST') {
              // Reload environment variables from .env on every request
              const currentEnv = loadEnv(mode, process.cwd(), '')
              Object.assign(process.env, currentEnv)

              let bodyStr = ''
              req.on('data', chunk => {
                bodyStr += chunk
              })
              req.on('end', async () => {
                try {
                  const body = JSON.parse(bodyStr)
                  
                  // Dynamically load the TypeScript API function using Vite's SSR runtime
                  const apiModule = await server.ssrLoadModule('/api/register.ts')
                  const handler = apiModule.default

                  const nodeRes = {
                    statusCode: 200,
                    status(code: number) {
                      res.statusCode = code
                      return this
                    },
                    json(data: any) {
                      res.setHeader('Content-Type', 'application/json')
                      res.end(JSON.stringify(data))
                    },
                  }

                  const nodeReq = {
                    method: 'POST',
                    body: body,
                  }

                  await handler(nodeReq, nodeRes)
                } catch (err: any) {
                  console.error('[Local Dev /api/register error]:', err)
                  res.setHeader('Content-Type', 'application/json')
                  res.statusCode = 500
                  res.end(
                    JSON.stringify({
                      success: false,
                      stage: 'dev_server',
                      message: err.message || 'Error processing registration on dev server.',
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
