import { io } from 'socket.io-client'

export const socket = io('/', {
  path: '/socket.io',
  transports: ['websocket', 'polling'],
})

socket.on('connect', () => console.log('Socket conectado'))
socket.on('disconnect', () => console.log('Socket desconectado'))
