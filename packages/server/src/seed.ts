import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Evitar duplicar datos si ya existe el seed
  const categoriaCount = await prisma.categoria.count()
  if (categoriaCount > 0) {
    console.log('Ya existen datos, omitiendo seed.')
    return
  }

  console.log('Sembrando datos de prueba...')

  const entradas = await prisma.categoria.create({ data: { nombre: 'Entradas', orden: 1 } })
  const platos = await prisma.categoria.create({ data: { nombre: 'Platos Fuertes', orden: 2 } })
  const bebidas = await prisma.categoria.create({ data: { nombre: 'Bebidas', orden: 3 } })
  const postres = await prisma.categoria.create({ data: { nombre: 'Postres', orden: 4 } })

  await prisma.producto.createMany({
    data: [
      { nombre: 'Sopa del día', precio: 35, categoriaId: entradas.id },
      { nombre: 'Ensalada César', precio: 45, categoriaId: entradas.id },
      { nombre: 'Pan con ajo', precio: 25, categoriaId: entradas.id },
      { nombre: 'Filete a la plancha', precio: 120, categoriaId: platos.id },
      { nombre: 'Pollo asado', precio: 85, categoriaId: platos.id },
      { nombre: 'Pasta carbonara', precio: 75, categoriaId: platos.id },
      { nombre: 'Churrasco', precio: 145, categoriaId: platos.id },
      { nombre: 'Agua pura', precio: 10, categoriaId: bebidas.id },
      { nombre: 'Gaseosa', precio: 15, categoriaId: bebidas.id },
      { nombre: 'Jugo natural', precio: 25, categoriaId: bebidas.id },
      { nombre: 'Café americano', precio: 18, categoriaId: bebidas.id },
      { nombre: 'Pastel de chocolate', precio: 35, categoriaId: postres.id },
      { nombre: 'Flan', precio: 30, categoriaId: postres.id },
    ],
  })

  const mesaCount = await prisma.mesa.count()
  if (mesaCount === 0) {
    for (let i = 1; i <= 10; i++) {
      await prisma.mesa.create({ data: { numero: i, nombre: `Mesa ${i}` } })
    }
  }

  console.log('✓ Datos creados: 4 categorías, 13 productos, 10 mesas')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
