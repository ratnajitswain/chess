import Game, { SafeGame, toSafeGame, IGame } from '@/models/Game'
import dbConnect from '@/lib/mongodb'
import mongoose from 'mongoose'

export async function createGame(whitePlayerId: string, blackPlayerId: string): Promise<SafeGame> {
  await dbConnect()

  const newGame = new Game({
    whitePlayer: new mongoose.Types.ObjectId(whitePlayerId),
    blackPlayer: new mongoose.Types.ObjectId(blackPlayerId),
    moves: [],
    startTime: new Date()
  })

  await newGame.save()

  return toSafeGame(newGame)
}

export async function updateGame(gameId: string, moves: string[], winner: string | null): Promise<SafeGame> {
  await dbConnect()

  const updatedGame = await Game.findByIdAndUpdate(
    gameId,
    { 
      moves, 
      winner: winner ? new mongoose.Types.ObjectId(winner) : null,
      endTime: winner ? new Date() : null,
    },
    { new: true }
  )

  if (!updatedGame) {
    throw new Error('Game not found')
  }

  return toSafeGame(updatedGame)
}

export async function getGameById(gameId: string): Promise<SafeGame | null> {
  await dbConnect()

  const game = await Game.findById(gameId)

  if (!game) {
    return null
  }

  return toSafeGame(game)
}

export async function getGamesByUser(userId: string): Promise<SafeGame[]> {
  await dbConnect()

  const games = await Game.find({
    $or: [{ whitePlayer: userId }, { blackPlayer: userId }]
  })

  return games.map(toSafeGame)
}