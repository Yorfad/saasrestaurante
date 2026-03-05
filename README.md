# RestaurApp

Sistema de gestión para restaurantes — Pedidos, Cocina, Dashboard y FEL (Guatemala).

## Estructura

```
restaurante/
├── packages/
│   ├── server/    # API (Fastify + Prisma + Socket.io)
│   └── web/       # Frontend (React + Tailwind)
├── docker-compose.yml
└── package.json
```

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript + Tailwind CSS |
| Backend | Fastify + TypeScript |
| Base de datos (local) | SQLite via Prisma |
| Base de datos (nube) | PostgreSQL via Prisma |
| Tiempo real | Socket.io |
| Contenedores | Docker + docker-compose |

## Correr en desarrollo (sin Docker)

### Requisitos
- Node.js 20+
- npm 10+

### Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno del servidor
cp packages/server/.env.example packages/server/.env

# 3. Crear base de datos y correr migraciones
npm run db:push

# 4. Sembrar datos de prueba (mesas, productos)
npm run db:seed

# 5. Correr todo
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001
- DB Studio: `npm run db:studio -w @restaurante/server`

## Desplegar en servidor (con Docker)

```bash
# En el servidor
git clone <repo>
docker-compose up -d

# Primera vez — sembrar datos
docker-compose exec server npx tsx src/seed.ts
```

- Web: http://tu-servidor
- API: http://tu-servidor:3001

## Vistas

| Vista | URL | Para quién |
|-------|-----|-----------|
| Mesas | / | Meseros |
| Cocina | /cocina | Cocineros |
| Dashboard | /dashboard | Dueño / Admin |

## Flujo de un pedido

```
Mesero selecciona mesa
  → Agrega productos al carrito
  → "Enviar a cocina"
  → Cocina ve el pedido en tiempo real
  → Cocinero marca "Listo"
  → Mesero cobra y cierra la mesa
  → Dashboard actualiza ventas del día
```

## Próximas versiones

- [ ] Autenticación (roles: admin, mesero, cocina)
- [ ] FEL — Factura electrónica SAT Guatemala
- [ ] Pago con tarjeta (captura de autorización)
- [ ] Inventario y recetas
- [ ] Modo offline completo (PWA + Service Worker)
- [ ] Reporte semanal/mensual
- [ ] Múltiples sucursales
