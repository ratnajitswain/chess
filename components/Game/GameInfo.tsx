import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface GameInfoProps {
  gameId: string | null
}

interface GameInfo {
  whitePlayer: string
  blackPlayer: string
  currentTurn: 'white' | 'black'
  timeLeft: {
    white: number
    black: number
  }
}

export default function GameInfo({ gameId }: GameInfoProps) {
  const { data: session } = useSession()
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null)

  useEffect(() => {
    if (gameId) {
      // Fetch game info from the server
      // Update the gameInfo state
    }
  }, [gameId])

  if (!gameInfo) {
    return <div>Loading game information...</div>
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Game Information</h2>
      <div className="space-y-2">
        <p><span className="font-semibold">White:</span> {gameInfo.whitePlayer}</p>
        <p><span className="font-semibold">Black:</span> {gameInfo.blackPlayer}</p>
        <p><span className="font-semibold">Current Turn:</span> {gameInfo.currentTurn}</p>
        <p><span className="font-semibold">Time Left:</span></p>
        <p className="pl-4">White: {Math.floor(gameInfo.timeLeft.white / 60)}:{(gameInfo.timeLeft.white % 60).toString().padStart(2, '0')}</p>
        <p className="pl-4">Black: {Math.floor(gameInfo.timeLeft.black / 60)}:{(gameInfo.timeLeft.black % 60).toString().padStart(2, '0')}</p>
      </div>
    </div>
  )
}