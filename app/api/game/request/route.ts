import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { getUserByEmail } from '@/utils/auth'
import dbConnect from '@/lib/mongodb'
import mongoose from 'mongoose'
import GameRequest from '@/models/GameRequest'
import { sendNotification } from '@/utils/notifications'  // We'll create this utility
export const maxDuration = 60;
export const dynamic = 'force-dynamic';
export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { opponentEmail } = await req.json()

    if (!opponentEmail) {
      return NextResponse.json({ message: 'Missing opponent email' }, { status: 400 })
    }

    const currentUser = await getUserByEmail(session.user.email!)
    const opponentUser = await getUserByEmail(opponentEmail)

    if (!currentUser || !opponentUser) {
      return NextResponse.json({ message: 'Invalid user' }, { status: 400 })
    }

    if (currentUser._id.toString() === opponentUser._id.toString()) {
      return NextResponse.json({ message: 'Cannot create a game against yourself' }, { status: 400 })
    }

    // Create a game request
    const gameRequest = new GameRequest({
      requester: currentUser._id,
      opponent: opponentUser._id,
    })

    await gameRequest.save()

    // Send notification to the opponent
    await sendNotification(opponentUser._id, 'New game request', `${currentUser.name} has invited you to play a game of chess.`)
    let gameData = await new Promise((resolve, reject)=>{
       let interval = setInterval(async ()=>{
          const gameData = await GameRequest.findById(gameRequest._id)
          if(gameData.game){
            clearInterval(interval)
            return resolve(gameData.game)
          }
        },5000)
    })
    return NextResponse.json({ 
      gameId: gameData?.toString() || null,
      message: gameData?'Game accepted':'Timeout please send request again'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating game request:', error)
    
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ message: 'Invalid data provided' }, { status: 400 })
    }

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}