import { NextRequest, NextResponse } from 'next/server'
import { getGameById, updateGame } from '@/utils/game'
import { Chess } from 'chess.js'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'
export const dynamic = 'force-dynamic';
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

  // Check if it's the current player's turn
  const chess = new Chess()
  chess.loadPgn(game.moves.join(' '))
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
  let newMove = [...game.moves,move]
  const updatedGame = await updateGame(gameId, newMove, winner)
  
  if (!updatedGame) {
    return NextResponse.json({ error: 'Failed to update game' }, { status: 400 })
  }

  return NextResponse.json(updatedGame)
}