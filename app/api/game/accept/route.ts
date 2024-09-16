import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb'
import mongoose from 'mongoose'
import GameRequest from '@/models/GameRequest'
import { createGame } from '@/utils/game'
import { sendNotification } from '@/utils/notifications'

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { requestId } = await req.json()

    if (!requestId) {
      return NextResponse.json({ message: 'Missing request ID' }, { status: 400 })
    }

    const gameRequest = await GameRequest.findById(requestId).populate('requester opponent')

    if (!gameRequest) {
      return NextResponse.json({ message: 'Game request not found' }, { status: 404 })
    }

    if (gameRequest.opponent._id.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (gameRequest.status !== 'pending') {
      return NextResponse.json({ message: 'Game request is no longer pending' }, { status: 400 })
    }

    // Randomly assign colors
    const [whitePlayerId, blackPlayerId] = Math.random() < 0.5
      ? [gameRequest.requester._id, gameRequest.opponent._id]
      : [gameRequest.opponent._id, gameRequest.requester._id]

    // Create the game
    const game = await createGame(whitePlayerId.toString(), blackPlayerId.toString())

    // Update the game request
    gameRequest.status = 'accepted'
    gameRequest.game = game.id
    await gameRequest.save()

    // Notify the requester
    await sendNotification(gameRequest.requester._id, 'Game request accepted', `${gameRequest.opponent.name} has accepted your game request.`)

    return NextResponse.json({ 
      gameId: game.id.toString(),
      message: 'Game request accepted successfully' 
    }, { status: 200 })

  } catch (error) {
    console.error('Error accepting game request:', error)
    
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ message: 'Invalid data provided' }, { status: 400 })
    }

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}