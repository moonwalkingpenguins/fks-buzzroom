import { createServer } from 'http'
import next from 'next'
import { initSocket } from './src/lib/socket-server'
import { registerSocketHandlers } from './src/lib/socket-handlers'

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare()
  .then(() => {
    const httpServer = createServer((req, res) => handle(req, res))
    const io = initSocket(httpServer)
    registerSocketHandlers(io)
    httpServer.listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
  })
  .catch((err: Error) => {
    console.error('Failed to start server:', err)
    process.exit(1)
  })
