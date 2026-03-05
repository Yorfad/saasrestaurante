import { FastifyInstance } from 'fastify'
import { prisma, io } from '../index'
import { z } from 'zod'

const mesaSchema = z.object({
  numero: z.number().int().positive(),
  nombre: z.string().optional(),
})

const estadoSchema = z.object({
  estado: z.enum(['LIBRE', 'OCUPADA', 'CUENTA']),
})

export async function mesasRoutes(app: FastifyInstance) {
  // Listar todas las mesas
  app.get('/', async () => {
    return prisma.mesa.findMany({
      orderBy: { numero: 'asc' },
      include: {
        pedidos: {
          where: { estado: { not: 'CERRADO' } },
          include: { items: { include: { producto: true } } },
          orderBy: { creadoEn: 'desc' },
          take: 1,
        },
      },
    })
  })

  // Crear mesa
  app.post('/', async (req, reply) => {
    const body = mesaSchema.parse(req.body)
    const mesa = await prisma.mesa.create({ data: body })
    io.emit('mesa:actualizada', mesa)
    return reply.code(201).send(mesa)
  })

  // Actualizar estado de mesa
  app.patch('/:id/estado', async (req, reply) => {
    const { id } = req.params as { id: string }
    const body = estadoSchema.parse(req.body)
    const mesa = await prisma.mesa.update({
      where: { id: Number(id) },
      data: { estado: body.estado },
    })
    io.emit('mesa:actualizada', mesa)
    return mesa
  })

  // Eliminar mesa
  app.delete('/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    await prisma.mesa.delete({ where: { id: Number(id) } })
    io.emit('mesa:eliminada', { id: Number(id) })
    return reply.code(204).send()
  })
}
