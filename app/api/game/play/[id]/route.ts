import { NextRequest, NextResponse } from 'next/server'
import { getGameById, updateGame } from '@/utils/game'
import { Chess } from 'chess.js'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'
export const dynamic = 'force-dynamic';
import { makeAIMove } from '@/utils/ai';
export const maxDuration = 60;
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const gameId = params.id
  let game = await getGameById(gameId)
  
  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 })
  }

  // Ensure game object is serializable
  game = JSON.parse(JSON.stringify(game))
  return NextResponse.json(game)
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const gameId = params.id
  const { move } = await request.json()
  
  const game = await getGameById(gameId)
  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 })
  }

  const chess = new Chess()
  chess.loadPgn(game.moves.join(' '))

  // Check if it's the current player's turn
  if (chess.turn() === 'w' && game.whitePlayer !== session.user.id) {
    return NextResponse.json({ error: 'Not your turn' }, { status: 400 })
  }
  if (chess.turn() === 'b' && game.blackPlayer !== session.user.id) {
    return NextResponse.json({ error: 'Not your turn' }, { status: 400 })
  }

  const result = chess.move(move)
  if (!result) {
    return NextResponse.json({ error: 'Invalid move' }, { status: 400 })
  }

  let winner = null
  if (chess.isGameOver()) {
    if (chess.isCheckmate()) {
      winner = chess.turn() === 'w' ? game.blackPlayer : game.whitePlayer
    } else if (chess.isDraw()) {
      winner = 'draw'
    }
  }

  let newMoves = [...game.moves, move]
  let updatedGame = await updateGame(gameId, newMoves, winner)
  
  if (!updatedGame) {
    return NextResponse.json({ error: 'Failed to update game' }, { status: 400 })
  }

  // Check if it's AI's turn to move
  if (!chess.isGameOver() && process.env.AI_USER_OBJECT_ID === (chess.turn() === 'w' ? game.whitePlayer : game.blackPlayer)) {
    try {
      const aiMove = await makeAIMove(chess.fen(),newMoves)
      chess.move(aiMove)
      newMoves.push(aiMove)

      // Check for game over after AI move
      if (chess.isGameOver()) {
        if (chess.isCheckmate()) {
          winner = chess.turn() === 'w' ? game.blackPlayer : game.whitePlayer
        } else if (chess.isDraw()) {
          winner = 'draw'
        }
      }

      updatedGame = await updateGame(gameId, newMoves, winner)
      if (!updatedGame) {
        return NextResponse.json({ error: 'Failed to update game after AI move' }, { status: 400 })
      }
    } catch (error) {
      console.error('Error making AI move:', error)
      // If AI move fails, we'll return the game state after the human move
    }
  }

  return NextResponse.json(updatedGame)
}