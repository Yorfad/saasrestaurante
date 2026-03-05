import { FastifyInstance } from 'fastify'
import { prisma } from '../index'

export async function reportesRoutes(app: FastifyInstance) {
  // Resumen del día
  app.get('/hoy', async () => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const [pedidos, totalVentas, topProductos] = await Promise.all([
      prisma.pedido.findMany({
        where: { creadoEn: { gte: hoy }, estado: 'CERRADO' },
        include: { mesa: true, items: { include: { producto: true } } },
        orderBy: { creadoEn: 'desc' },
      }),
      prisma.pedido.aggregate({
        where: { creadoEn: { gte: hoy }, estado: 'CERRADO' },
        _sum: { total: true },
        _count: true,
      }),
      prisma.pedidoItem.groupBy({
        by: ['productoId'],
        where: { pedido: { creadoEn: { gte: hoy }, estado: 'CERRADO' } },
        _sum: { cantidad: true },
        orderBy: { _sum: { cantidad: 'desc' } },
        take: 5,
      }),
    ])

    // Obtener nombres de los productos top
    const productosIds = topProductos.map((p) => p.productoId)
    const productos = await prisma.producto.findMany({
      where: { id: { in: productosIds } },
    })
    const productosMap = new Map(productos.map((p) => [p.id, p]))

    return {
      fecha: hoy,
      totalVentas: totalVentas._sum.total ?? 0,
      totalPedidos: totalVentas._count,
      topProductos: topProductos.map((p) => ({
        producto: productosMap.get(p.productoId),
        cantidad: p._sum.cantidad,
      })),
      pedidos,
    }
  })

  // Pedidos activos en este momento
  app.get('/activos', async () => {
    return prisma.pedido.findMany({
      where: { estado: { not: 'CERRADO' } },
      include: { mesa: true, items: { include: { producto: true } } },
      orderBy: { creadoEn: 'asc' },
    })
  })
}
