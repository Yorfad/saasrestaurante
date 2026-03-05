import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPedidos, updateEstadoPedido, Pedido } from '../lib/api'
import { socket } from '../lib/socket'

const columnas: { estado: Pedido['estado']; label: string; color: string }[] = [
  { estado: 'EN_COCINA', label: 'En cocina', color: 'border-yellow-500' },
  { estado: 'LISTO', label: 'Listo para servir', color: 'border-green-500' },
]

function tiempoTranscurrido(fechaStr: string) {
  const diff = Math.floor((Date.now() - new Date(fechaStr).getTime()) / 1000)
  if (diff < 60) return `${diff}s`
  return `${Math.floor(diff / 60)}m ${diff % 60}s`
}

function colorTiempo(fechaStr: string) {
  const mins = (Date.now() - new Date(fechaStr).getTime()) / 60000
  if (mins < 10) return 'text-green-400'
  if (mins < 20) return 'text-yellow-400'
  return 'text-red-400'
}

export default function CocinaPage() {
  const qc = useQueryClient()

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos-cocina'],
    queryFn: () => getPedidos(),
    refetchInterval: 10000,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: Pedido['estado'] }) =>
      updateEstadoPedido(id, estado),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pedidos-cocina'] }),
  })

  // Tiempo real — pedidos nuevos llegan sin refrescar
  useEffect(() => {
    const refresh = () => qc.invalidateQueries({ queryKey: ['pedidos-cocina'] })
    socket.on('pedido:nuevo', refresh)
    socket.on('pedido:actualizado', refresh)
    return () => {
      socket.off('pedido:nuevo', refresh)
      socket.off('pedido:actualizado', refresh)
    }
  }, [qc])

  const pedidosPorEstado = (estado: Pedido['estado']) =>
    pedidos.filter((p) => p.estado === estado)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Cocina</h1>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          En vivo
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {columnas.map(({ estado, label, color }) => (
          <div key={estado}>
            <div className={`flex items-center gap-2 mb-3 border-l-4 pl-3 ${color}`}>
              <h2 className="font-semibold text-lg">{label}</h2>
              <span className="bg-gray-800 text-gray-300 text-xs rounded-full px-2 py-0.5">
                {pedidosPorEstado(estado).length}
              </span>
            </div>

            <div className="space-y-3">
              {pedidosPorEstado(estado).length === 0 && (
                <div className="card text-gray-500 text-sm text-center py-8">Sin pedidos</div>
              )}

              {pedidosPorEstado(estado).map((pedido) => (
                <div key={pedido.id} className="card space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-lg">Mesa {pedido.mesa.numero}</span>
                      {pedido.mesa.nombre && (
                        <span className="text-gray-400 text-sm ml-2">{pedido.mesa.nombre}</span>
                      )}
                    </div>
                    <span className={`text-sm font-mono font-bold ${colorTiempo(pedido.creadoEn)}`}>
                      {tiempoTranscurrido(pedido.creadoEn)}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-1">
                    {pedido.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm">
                        <span className="bg-brand-500 text-white rounded px-1.5 py-0.5 text-xs font-bold min-w-[1.5rem] text-center">
                          {item.cantidad}
                        </span>
                        <span>{item.producto.nombre}</span>
                        {item.notas && (
                          <span className="text-yellow-400 text-xs">({item.notas})</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {pedido.notas && (
                    <div className="text-xs text-yellow-400 bg-yellow-400/10 rounded p-2">
                      Nota: {pedido.notas}
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex gap-2 pt-1">
                    {estado === 'EN_COCINA' && (
                      <button
                        onClick={() => updateMutation.mutate({ id: pedido.id, estado: 'LISTO' })}
                        className="flex-1 btn bg-green-600 hover:bg-green-700 text-white text-sm"
                      >
                        Marcar listo
                      </button>
                    )}
                    {estado === 'LISTO' && (
                      <button
                        onClick={() => updateMutation.mutate({ id: pedido.id, estado: 'CERRADO' })}
                        className="flex-1 btn bg-gray-700 hover:bg-gray-600 text-sm"
                      >
                        Entregado / Cerrar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
