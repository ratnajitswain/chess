import mongoose from 'mongoose'

const gameRequestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  opponent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
})

const GameRequest = mongoose.models.GameRequest || mongoose.model('GameRequest', gameRequestSchema)

export default GameRequest