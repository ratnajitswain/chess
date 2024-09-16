import mongoose from 'mongoose'

export interface IGame extends mongoose.Document {
  whitePlayer: mongoose.Types.ObjectId
  blackPlayer: mongoose.Types.ObjectId
  moves: string[]
  winner: mongoose.Types.ObjectId | null
  startTime: Date
  endTime: Date | null
  createdAt: Date
  updatedAt: Date
}

const gameSchema = new mongoose.Schema<IGame>({
  whitePlayer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  blackPlayer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  moves: [{ type: String }],
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

export interface SafeGame {
  id: string
  whitePlayer: string
  blackPlayer: string
  moves: string[]
  winner: string | null
  startTime: string
  endTime: string | null
}

export function toSafeGame(game: IGame): SafeGame {
  return {
    id: game._id.toString(),
    whitePlayer: game.whitePlayer.toString(),
    blackPlayer: game.blackPlayer.toString(),
    moves: game.moves,
    winner: game.winner ? game.winner.toString() : null,
    startTime: game.startTime.toISOString(),
    endTime: game.endTime ? game.endTime.toISOString() : null,
  }
}

export default mongoose.models.Game || mongoose.model<IGame>('Game', gameSchema)