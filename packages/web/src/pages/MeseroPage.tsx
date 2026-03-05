import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMesas, getProductos, crearPedido, updateEstadoPedido, Mesa, Producto } from '../lib/api'
import { socket } from '../lib/socket'

const estadoColor: Record<Mesa['estado'], string> = {
  LIBRE: 'border-green-500 bg-green-500/10',
  OCUPADA: 'border-blue-500 bg-blue-500/10',
  CUENTA: 'border-orange-500 bg-orange-500/10',
}

const estadoLabel: Record<Mesa['estado'], string> = {
  LIBRE: 'Libre',
  OCUPADA: 'Ocupada',
  CUENTA: 'Cuenta',
}

interface ItemCarrito {
  producto: Producto
  cantidad: number
  notas: string
}

export default function MeseroPage() {
  const qc = useQueryClient()
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null)
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const [notas, setNotas] = useState('')

  const { data: mesas = [] } = useQuery({ queryKey: ['mesas'], queryFn: getMesas })
  const { data: categorias = [] } = useQuery({ queryKey: ['productos'], queryFn: getProductos })

  const crearPedidoMutation = useMutation({
    mutationFn: crearPedido,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mesas'] })
      setMesaSeleccionada(null)
      setCarrito([])
      setNotas('')
    },
  })

  const cerrarPedidoMutation = useMutation({
    mutationFn: ({ id }: { id: number }) => updateEstadoPedido(id, 'CERRADO'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mesas'] }),
  })

  // Tiempo real
  useEffect(() => {
    const handler = () => qc.invalidateQueries({ queryKey: ['mesas'] })
    socket.on('mesa:actualizada', handler)
    socket.on('pedido:actualizado', handler)
    return () => {
      socket.off('mesa:actualizada', handler)
      socket.off('pedido:actualizado', handler)
    }
  }, [qc])

  function agregarAlCarrito(producto: Producto) {
    setCarrito((prev) => {
      const existe = prev.find((i) => i.producto.id === producto.id)
      if (existe) return prev.map((i) => i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i)
      return [...prev, { producto, cantidad: 1, notas: '' }]
    })
  }

  function cambiarCantidad(productoId: number, delta: number) {
    setCarrito((prev) =>
      prev
        .map((i) => i.producto.id === productoId ? { ...i, cantidad: i.cantidad + delta } : i)
        .filter((i) => i.cantidad > 0)
    )
  }

  const total = carrito.reduce((sum, i) => sum + i.producto.precio * i.cantidad, 0)

  const pedidoActivo = mesaSeleccionada?.pedidos?.[0]

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mesas</h1>

      {/* Grid de mesas */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-8">
        {mesas.map((mesa) => (
          <button
            key={mesa.id}
            onClick={() => { setMesaSeleccionada(mesa); setCarrito([]) }}
            className={`card border-2 cursor-pointer hover:scale-105 transition-transform text-center ${estadoColor[mesa.estado]}`}
          >
            <div className="text-2xl font-bold">{mesa.numero}</div>
            <div className="text-xs text-gray-400 mt-1">{mesa.nombre}</div>
            <div className={`text-xs mt-1 font-medium ${
              mesa.estado === 'LIBRE' ? 'text-green-400' :
              mesa.estado === 'OCUPADA' ? 'text-blue-400' : 'text-orange-400'
            }`}>
              {estadoLabel[mesa.estado]}
            </div>
            {mesa.pedidos?.[0] && (
              <div className="text-xs text-gray-500 mt-1">
                Q {mesa.pedidos[0].total.toFixed(2)}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Modal de pedido */}
      {mesaSeleccionada && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-xl font-bold">
                Mesa {mesaSeleccionada.numero}
                {mesaSeleccionada.nombre && (
                  <span className="text-gray-400 text-sm ml-2">— {mesaSeleccionada.nombre}</span>
                )}
              </h2>
              <button onClick={() => setMesaSeleccionada(null)} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Menú */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {categorias.map((cat) => (
                  <div key={cat.id}>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">{cat.nombre}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {cat.productos.map((prod) => (
                        <button
                          key={prod.id}
                          onClick={() => agregarAlCarrito(prod)}
                          className="flex items-center justify-between bg-gray-800 hover:bg-gray-700 rounded-lg p-3 text-left transition-colors"
                        >
                          <span className="text-sm">{prod.nombre}</span>
                          <span className="text-brand-500 font-semibold text-sm ml-2">Q {prod.precio}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Carrito */}
              <div className="w-72 border-l border-gray-800 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  <h3 className="font-semibold text-gray-300 mb-3">Pedido</h3>
                  {carrito.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center mt-8">Selecciona productos del menú</p>
                  ) : (
                    carrito.map((item) => (
                      <div key={item.producto.id} className="flex items-center gap-2">
                        <div className="flex-1 text-sm">{item.producto.nombre}</div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => cambiarCantidad(item.producto.id, -1)} className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 text-sm">−</button>
                          <span className="w-6 text-center text-sm">{item.cantidad}</span>
                          <button onClick={() => cambiarCantidad(item.producto.id, 1)} className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 text-sm">+</button>
                        </div>
                        <span className="text-sm text-gray-400 w-16 text-right">
                          Q {(item.producto.precio * item.cantidad).toFixed(0)}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Notas y total */}
                <div className="p-4 border-t border-gray-800 space-y-3">
                  <textarea
                    placeholder="Notas del pedido..."
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    className="w-full bg-gray-800 rounded-lg p-2 text-sm resize-none h-16 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-brand-500">Q {total.toFixed(2)}</span>
                  </div>

                  {/* Botones */}
                  {pedidoActivo && pedidoActivo.estado !== 'CERRADO' && (
                    <button
                      onClick={() => cerrarPedidoMutation.mutate({ id: pedidoActivo.id })}
                      className="w-full btn bg-green-600 hover:bg-green-700 text-white"
                    >
                      Cobrar y cerrar mesa
                    </button>
                  )}
                  <button
                    disabled={carrito.length === 0 || crearPedidoMutation.isPending}
                    onClick={() =>
                      crearPedidoMutation.mutate({
                        mesaId: mesaSeleccionada.id,
                        notas: notas || undefined,
                        items: carrito.map((i) => ({ productoId: i.producto.id, cantidad: i.cantidad })),
                      })
                    }
                    className="w-full btn-primary"
                  >
                    {crearPedidoMutation.isPending ? 'Enviando...' : 'Enviar a cocina'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
