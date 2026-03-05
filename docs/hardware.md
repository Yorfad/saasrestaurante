# Hardware y Red

## Kit recomendado por tamaño de restaurante

### Kit Básico (5–15 mesas) ~$650–950

| Componente | Modelo sugerido | Precio aprox. |
|-----------|----------------|---------------|
| Mini PC (servidor) | Beelink Mini S12 / Intel NUC | $150–250 |
| Router WiFi | TP-Link Archer AX23 | $40–70 |
| Tablet mesero ×2 | Samsung Tab A8 / Lenovo Tab M10 | $80–130 c/u |
| Impresora térmica ×2 | Epson TM-T20III | $90–130 c/u |
| Monitor caja | Cualquier monitor 21" HDMI | $60–100 |
| UPS | APC Back-UPS 600VA | $40–60 |
| Switch ethernet | TP-Link 8 puertos | $20–30 |

### Kit Mediano (15–40 mesas) agrega:

| Extra | Precio |
|-------|--------|
| 2 tablets adicionales | +$160–260 |
| Impresora área adicional | +$90–130 |
| Router de mayor cobertura | +$60–100 |
| Raspberry Pi 4 (servidor backup) | +$80 |

## Configuración de red (paso a paso)

### 1. Conectar hardware
```
Internet (modem del proveedor)
    └── Router TP-Link
            ├── [cable ethernet] Mini PC → IP fija: 192.168.1.10
            ├── [WiFi] Tablet 1
            ├── [WiFi] Tablet 2
            └── [WiFi o cable] Monitor cocina
```

### 2. Asignar IP fija al Mini PC

En el router (acceder a 192.168.0.1 o 192.168.1.1):
1. Ir a "DHCP Server" → "Address Reservation"
2. Agregar la MAC del Mini PC → IP 192.168.1.10
3. Guardar y reiniciar router

Esto garantiza que el Mini PC **siempre tenga la misma IP**, sin importar reinicios.

### 3. Configurar las tablets

En la app (o archivo de configuración):
```
SERVER_URL=http://192.168.1.10:3001
CLOUD_URL=https://tusistema.com
```

La app intenta local primero. Si no responde en 5 segundos, cambia a nube.

## Servidor backup (Raspberry Pi)

Para tener redundancia ante fallo del Mini PC:

```
Mini PC (primario: 192.168.1.10)
    └── sync cada 5 min →
Raspberry Pi 4 (backup: 192.168.1.11)
```

Si el Mini PC falla:
1. Cambiar en la app la IP de 192.168.1.10 a 192.168.1.11
2. El Raspberry Pi tiene los datos hasta hace máximo 5 minutos
3. Tiempo de recuperación: ~2 minutos

## Monitor de cocina

No necesita hardware especial. Opciones:

| Opción | Costo | Cómo |
|--------|-------|------|
| Tablet vieja montada en pared | $0 (reutilizar) | Abrir browser en /cocina |
| Raspberry Pi + monitor | $80–120 | Kiosco modo pantalla completa |
| TV con navegador integrado | El que tengan | Chrome en Smart TV |

Para el modo pantalla completa en Raspberry Pi:
```bash
chromium-browser --kiosk http://192.168.1.10:5173/cocina
```

## Impresoras térmicas

### Modelos probados en producción
- **Epson TM-T20III** — USB/Ethernet, la más confiable
- **Star TSP100** — excelente calidad
- **Bixolon SRP-350** — buena relación precio/calidad

### Cómo conectan al sistema
La impresión la maneja el servidor (Mini PC), no el navegador.
Flujo: `Tablet → API → Servidor → impresora (USB o red local)`

Librería: `node-thermal-printer` (Node.js)
