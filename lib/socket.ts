import { Server as SocketIOServer } from 'socket.io'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Server as HTTPServer } from 'http'

export const config = {
  api: {
    bodyParser: false,
  },
}

interface SocketServer extends HTTPServer {
  io?: SocketIOServer | undefined
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponse) => {
  if (!(res.socket as any).server.io) {
    console.log('Socket is initializing')
    const io = new SocketIOServer((res.socket as any).server as HTTPServer)
    ;(res.socket as any).server.io = io

    io.on('connection', (socket) => {
      console.log('New client connected')

      socket.on('joinGame', (gameId) => {
        socket.join(gameId)
        console.log(`User joined game ${gameId}`)
      })

      socket.on('leaveGame', (gameId) => {
        socket.leave(gameId)
        console.log(`User left game ${gameId}`)
      })

      socket.on('move', ({ gameId, move }) => {
        socket.to(gameId).emit('moveMade', { gameId, move, playerId: socket.id })
      })

      socket.on('chatMessage', ({ gameId, message }) => {
        io.to(gameId).emit('newChatMessage', { gameId, message, sender: socket.id })
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected')
      })
    })
  } else {
    console.log('Socket is already running')
  }

  res.end()
}

export default SocketHandler