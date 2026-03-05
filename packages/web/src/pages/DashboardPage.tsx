import { useQuery } from '@tanstack/react-query'
import { getReporteHoy } from '../lib/api'

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card">
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['reporte-hoy'],
    queryFn: getReporteHoy,
    refetchInterval: 30000,
  })

  if (isLoading) return <div className="text-gray-400 text-center mt-20">Cargando...</div>
  if (!data) return null

  const ticketPromedio =
    data.totalPedidos > 0 ? data.totalVentas / data.totalPedidos : 0

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <span className="text-gray-400 text-sm">
          {new Date().toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="Ventas del día"
          value={`Q ${data.totalVentas.toFixed(2)}`}
          sub="pedidos cerrados"
        />
        <StatCard
          label="Pedidos cerrados"
          value={String(data.totalPedidos)}
        />
        <StatCard
          label="Ticket promedio"
          value={`Q ${ticketPromedio.toFixed(2)}`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top productos */}
        <div className="card">
          <h2 className="font-semibold mb-4">Productos más vendidos hoy</h2>
          {data.topProductos.length === 0 ? (
            <p className="text-gray-500 text-sm">Sin ventas aún</p>
          ) : (
            <div className="space-y-2">
              {data.topProductos.map((item, i) => (
                <div key={item.producto.id} className="flex items-center gap-3">
                  <span className="text-gray-500 text-sm w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="text-sm">{item.producto.nombre}</div>
                    <div className="h-1.5 bg-gray-800 rounded-full mt-1">
                      <div
                        className="h-1.5 bg-brand-500 rounded-full"
                        style={{ width: `${((item.cantidad ?? 0) / (data.topProductos[0]?.cantidad ?? 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-300">{item.cantidad}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimos pedidos */}
        <div className="card">
          <h2 className="font-semibold mb-4">Últimos pedidos cerrados</h2>
          {data.pedidos.length === 0 ? (
            <p className="text-gray-500 text-sm">Sin pedidos cerrados aún</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.pedidos.slice(0, 10).map((pedido) => (
                <div key={pedido.id} className="flex items-center justify-between text-sm border-b border-gray-800 pb-2">
                  <div>
                    <span className="font-medium">Mesa {pedido.mesa.numero}</span>
                    <span className="text-gray-500 ml-2 text-xs">
                      {new Date(pedido.cerradoEn!).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className="text-brand-500 font-semibold">Q {pedido.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
