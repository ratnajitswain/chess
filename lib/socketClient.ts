import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const initializeSocket = () => {
  if (!socket) {
    socket = io({
      path: '/api/socketio',
    })

    socket.on('connect', () => {
      console.log('Connected to server')
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from server')
    })
  }

  return socket
}

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initializeSocket first.')
  }
  return socket
}

export const joinGame = (gameId: string) => {
  const socket = getSocket()
  socket.emit('joinGame', gameId)
}

export const leaveGame = (gameId: string) => {
  const socket = getSocket()
  socket.emit('leaveGame', gameId)
}

export const sendMove = (gameId: string, move: string) => {
  const socket = getSocket()
  socket.emit('move', { gameId, move })
}

export const sendChatMessage = (gameId: string, message: string) => {
  const socket = getSocket()
  socket.emit('chatMessage', { gameId, message })
}