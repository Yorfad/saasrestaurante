import { FastifyInstance } from 'fastify'
import { prisma } from '../index'
import { z } from 'zod'

const productoSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  precio: z.number().positive(),
  disponible: z.boolean().optional().default(true),
  categoriaId: z.number().int().positive(),
})

const categoriaSchema = z.object({
  nombre: z.string().min(1),
  orden: z.number().int().optional().default(0),
})

export async function productosRoutes(app: FastifyInstance) {
  // Listar productos por categoría
  app.get('/', async () => {
    return prisma.categoria.findMany({
      orderBy: { orden: 'asc' },
      include: {
        productos: {
          where: { disponible: true },
          orderBy: { nombre: 'asc' },
        },
      },
    })
  })

  // Crear categoría
  app.post('/categorias', async (req, reply) => {
    const body = categoriaSchema.parse(req.body)
    const categoria = await prisma.categoria.create({ data: body })
    return reply.code(201).send(categoria)
  })

  // Crear producto
  app.post('/', async (req, reply) => {
    const body = productoSchema.parse(req.body)
    const producto = await prisma.producto.create({
      data: body,
      include: { categoria: true },
    })
    return reply.code(201).send(producto)
  })

  // Actualizar disponibilidad
  app.patch('/:id/disponible', async (req) => {
    const { id } = req.params as { id: string }
    const { disponible } = req.body as { disponible: boolean }
    return prisma.producto.update({
      where: { id: Number(id) },
      data: { disponible },
    })
  })
}
