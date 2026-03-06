import { io } from 'socket.io-client'

// En desarrollo: conecta a '/' y Vite hace proxy de WebSocket
// En producción (Vercel): conecta directo a Railway
const SERVER_URL = import.meta.env.VITE_API_URL ?? '/'

export const socket = io(SERVER_URL, {
  path: '/socket.io',
  transports: ['websocket', 'polling'],
})

socket.on('connect', () => console.log('Socket conectado'))
socket.on('disconnect', () => console.log('Socket desconectado'))
