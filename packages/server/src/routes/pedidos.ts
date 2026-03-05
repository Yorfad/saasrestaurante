import { FastifyInstance } from 'fastify'
import { prisma, io } from '../index'
import { z } from 'zod'

const itemSchema = z.object({
  productoId: z.number().int().positive(),
  cantidad: z.number().int().positive(),
  notas: z.string().optional(),
})

const pedidoSchema = z.object({
  mesaId: z.number().int().positive(),
  notas: z.string().optional(),
  items: z.array(itemSchema).min(1),
})

const estadoSchema = z.object({
  estado: z.enum(['PENDIENTE', 'EN_COCINA', 'LISTO', 'CERRADO']),
})

const INCLUDE_FULL = {
  mesa: true,
  items: {
    include: { producto: true },
  },
}

export async function pedidosRoutes(app: FastifyInstance) {
  // Listar pedidos activos (no cerrados)
  app.get('/', async (req) => {
    const { estado } = req.query as { estado?: string }
    return prisma.pedido.findMany({
      where: estado ? { estado } : { estado: { not: 'CERRADO' } },
      include: INCLUDE_FULL,
      orderBy: { creadoEn: 'asc' },
    })
  })

  // Obtener pedido por ID
  app.get('/:id', async (req) => {
    const { id } = req.params as { id: string }
    return prisma.pedido.findUnique({
      where: { id: Number(id) },
      include: INCLUDE_FULL,
    })
  })

  // Crear pedido nuevo
  app.post('/', async (req, reply) => {
    const body = pedidoSchema.parse(req.body)

    // Obtener precios actuales de los productos
    const productIds = body.items.map((i) => i.productoId)
    const productos = await prisma.producto.findMany({
      where: { id: { in: productIds } },
    })

    const productosMap = new Map(productos.map((p) => [p.id, p]))
    let total = 0

    const items = body.items.map((item) => {
      const producto = productosMap.get(item.productoId)
      if (!producto) throw new Error(`Producto ${item.productoId} no encontrado`)
      const precio = producto.precio
      total += precio * item.cantidad
      return { ...item, precio }
    })

    const pedido = await prisma.pedido.create({
      data: {
        mesaId: body.mesaId,
        notas: body.notas,
        total,
        estado: 'EN_COCINA',
        items: { create: items },
      },
      include: INCLUDE_FULL,
    })

    // Marcar mesa como ocupada
    await prisma.mesa.update({
      where: { id: body.mesaId },
      data: { estado: 'OCUPADA' },
    })

    // Notificar en tiempo real
    io.emit('pedido:nuevo', pedido)
    io.emit('mesa:actualizada', { id: body.mesaId, estado: 'OCUPADA' })

    return reply.code(201).send(pedido)
  })

  // Cambiar estado del pedido
  app.patch('/:id/estado', async (req) => {
    const { id } = req.params as { id: string }
    const { estado } = estadoSchema.parse(req.body)

    const data: Record<string, unknown> = { estado }
    if (estado === 'CERRADO') data.cerradoEn = new Date()

    const pedido = await prisma.pedido.update({
      where: { id: Number(id) },
      data,
      include: INCLUDE_FULL,
    })

    // Si se cierra el pedido, liberar mesa si no tiene otros pedidos activos
    if (estado === 'CERRADO') {
      const pedidosActivos = await prisma.pedido.count({
        where: { mesaId: pedido.mesaId, estado: { not: 'CERRADO' } },
      })
      if (pedidosActivos === 0) {
        await prisma.mesa.update({
          where: { id: pedido.mesaId },
          data: { estado: 'LIBRE' },
        })
        io.emit('mesa:actualizada', { id: pedido.mesaId, estado: 'LIBRE' })
      }
    }

    io.emit('pedido:actualizado', pedido)
    return pedido
  })
}
