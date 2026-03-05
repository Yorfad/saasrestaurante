import Fastify from 'fastify'
import cors from '@fastify/cors'
import { Server } from 'socket.io'
import { PrismaClient } from '@prisma/client'
import { mesasRoutes } from './routes/mesas'
import { productosRoutes } from './routes/productos'
import { pedidosRoutes } from './routes/pedidos'
import { reportesRoutes } from './routes/reportes'

const PORT = Number(process.env.PORT) || 3001

export const prisma = new PrismaClient()

const app = Fastify({ logger: { level: 'info' } })

// Socket.io — tiempo real para cocina y meseros
export const io = new Server(app.server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PATCH'] },
})

io.on('connection', (socket) => {
  console.log(`Cliente conectado: ${socket.id}`)
  socket.on('disconnect', () => console.log(`Cliente desconectado: ${socket.id}`))
})

async function start() {
  await app.register(cors, { origin: '*' })

  // Rutas
  app.register(mesasRoutes, { prefix: '/mesas' })
  app.register(productosRoutes, { prefix: '/productos' })
  app.register(pedidosRoutes, { prefix: '/pedidos' })
  app.register(reportesRoutes, { prefix: '/reportes' })

  app.get('/health', async () => ({ status: 'ok', timestamp: new Date() }))

  await app.listen({ port: PORT, host: '0.0.0.0' })
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`)
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})
