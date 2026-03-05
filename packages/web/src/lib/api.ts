import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
})

// Tipos
export interface Mesa {
  id: number
  numero: number
  nombre: string | null
  estado: 'LIBRE' | 'OCUPADA' | 'CUENTA'
  pedidos: Pedido[]
}

export interface Categoria {
  id: number
  nombre: string
  orden: number
  productos: Producto[]
}

export interface Producto {
  id: number
  nombre: string
  descripcion: string | null
  precio: number
  disponible: boolean
  categoriaId: number
}

export interface PedidoItem {
  id: number
  productoId: number
  cantidad: number
  precio: number
  notas: string | null
  producto: Producto
}

export interface Pedido {
  id: number
  mesaId: number
  estado: 'PENDIENTE' | 'EN_COCINA' | 'LISTO' | 'CERRADO'
  total: number
  notas: string | null
  creadoEn: string
  cerradoEn: string | null
  mesa: Mesa
  items: PedidoItem[]
}

// API calls
export const getMesas = () => api.get<Mesa[]>('/mesas').then((r) => r.data)
export const updateEstadoMesa = (id: number, estado: Mesa['estado']) =>
  api.patch<Mesa>(`/mesas/${id}/estado`, { estado }).then((r) => r.data)

export const getProductos = () => api.get<Categoria[]>('/productos').then((r) => r.data)

export const getPedidos = (estado?: string) =>
  api
    .get<Pedido[]>('/pedidos', { params: estado ? { estado } : undefined })
    .then((r) => r.data)

export const crearPedido = (data: {
  mesaId: number
  notas?: string
  items: { productoId: number; cantidad: number; notas?: string }[]
}) => api.post<Pedido>('/pedidos', data).then((r) => r.data)

export const updateEstadoPedido = (id: number, estado: Pedido['estado']) =>
  api.patch<Pedido>(`/pedidos/${id}/estado`, { estado }).then((r) => r.data)

export const getReporteHoy = () =>
  api
    .get<{
      fecha: string
      totalVentas: number
      totalPedidos: number
      topProductos: { producto: Producto; cantidad: number }[]
      pedidos: Pedido[]
    }>('/reportes/hoy')
    .then((r) => r.data)
