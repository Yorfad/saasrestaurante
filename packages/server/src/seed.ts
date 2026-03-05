import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Sembrando datos de prueba...')

  // Categorías
  const entradas = await prisma.categoria.upsert({
    where: { id: 1 },
    update: {},
    create: { nombre: 'Entradas', orden: 1 },
  })
  const platos = await prisma.categoria.upsert({
    where: { id: 2 },
    update: {},
    create: { nombre: 'Platos Fuertes', orden: 2 },
  })
  const bebidas = await prisma.categoria.upsert({
    where: { id: 3 },
    update: {},
    create: { nombre: 'Bebidas', orden: 3 },
  })
  const postres = await prisma.categoria.upsert({
    where: { id: 4 },
    update: {},
    create: { nombre: 'Postres', orden: 4 },
  })

  // Productos
  const productosData = [
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
  ]

  for (const producto of productosData) {
    await prisma.producto.create({ data: producto })
  }

  // Mesas
  for (let i = 1; i <= 10; i++) {
    await prisma.mesa.upsert({
      where: { numero: i },
      update: {},
      create: { numero: i, nombre: `Mesa ${i}` },
    })
  }

  console.log('✓ Datos de prueba creados correctamente')
  console.log('  - 4 categorías')
  console.log('  - 13 productos')
  console.log('  - 10 mesas')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
