# Arquitectura del Sistema

## Diagrama general

```
                     NUBE (tusistema.com)
                ┌─────────────────────────────┐
                │  Node.js + PostgreSQL        │
                │  - Sync de ventas            │
                │  - Dashboard del dueño       │
                │  - Backup automático         │
                │  - FEL (calls al PAC)        │
                └──────────────┬──────────────┘
                               │ sync periódico
                               │ (WebSocket o polling)
                ┌──────────────┴──────────────┐
                │   MINI PC LOCAL             │
                │   Node.js + SQLite          │
                │   - Lógica del negocio      │
                │   - Impresión directa       │
                │   - Funciona sin internet   │
                └──────────────┬──────────────┘
                               │ red local WiFi
              ┌────────────────┼────────────────┐
              │                │                │
         [Tablet 1]      [Tablet 2]     [Monitor cocina]
         React PWA        React PWA       React PWA
         (mesero)         (mesero)        (solo lectura)
```

## Modo failover

```
NORMAL        → Tablets apuntan a Mini PC local (192.168.1.10)
FAILOVER PC   → Tablets apuntan a nube (tusistema.com)  [automático]
FAILOVER NET  → Tablets usan caché local (IndexedDB)    [offline mode]
```

## Base de datos

### Local (SQLite)
- Operación diaria sin depender de internet
- Rápida (sub-millisecond para operaciones CRUD simples)
- Archivo único — fácil de hacer backup

### Nube (PostgreSQL)
- Fuente de verdad histórica
- Dashboard del dueño
- Múltiples sucursales

## WebSocket — eventos en tiempo real

| Evento | Quién emite | Quién escucha |
|--------|-------------|---------------|
| `pedido:nuevo` | Server (POST /pedidos) | Cocina |
| `pedido:actualizado` | Server (PATCH /pedidos/:id/estado) | Todos |
| `mesa:actualizada` | Server (PATCH /mesas/:id/estado) | Meseros |
| `mesa:eliminada` | Server (DELETE /mesas/:id) | Meseros |

## Impresión

La impresión de tickets **no se hace desde el navegador**. El servidor local (Mini PC)
habla directamente con las impresoras térmicas vía `node-thermal-printer`.

Flujo:
```
Tablet → POST /pedidos → Server → guarda en DB → emite Socket → imprime ticket
```

## Seguridad (v2)

- JWT con roles: `admin`, `mesero`, `cocina`
- El dueño (admin) puede ver dashboard y configuración
- El mesero solo puede crear pedidos
- Cocina solo puede cambiar estado de pedidos
