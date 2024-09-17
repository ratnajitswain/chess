import { useState, useEffect, useCallback } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { useSession } from 'next-auth/react'

interface BoardProps {
  gameId: string | null
}

export default function Board({ gameId }: BoardProps) {
  const [game, setGame] = useState(new Chess())
  const [orientation, setOrientation] = useState('white')
  const [isGameOver, setIsGameOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()

  const fetchGameState = useCallback(async () => {
    if (!gameId || !session?.user?.id) return

    try {
      const response = await fetch(`/api/game/play/${gameId}`)
      if (response.ok) {
        const gameState = await response.json()
        const newGame = new Chess()
        
        // Safely apply moves from PGN
        try {
          const moves = gameState.moves
          for (const move of moves) {
            if (!newGame.move(move)) {
              console.error(`Invalid move in PGN: ${move}`)
              setError(`Invalid move in game history: ${move}. Please contact support.`)
              return
            }
          }
        } catch (error) {
          console.error('Error applying moves from PGN:', error)
          setError('Error loading game state. Please try refreshing the page.')
          return
        }
        
        setGame(newGame)
        setError(null)  // Clear any previous errors
        
        if (gameState.whitePlayer === session.user.id) {
          setOrientation('white')
        } else if (gameState.blackPlayer === session.user.id) {
          setOrientation('black')
        }
        
        setIsGameOver(!!gameState.winner)
      } else {
        console.error('Failed to fetch game state:', await response.text())
        setError('Failed to fetch game state. Please try again.')
      }
    } catch (error) {
      console.error('Error fetching game state:', error)
      setError('Error fetching game state. Please check your connection and try again.')
    }
  }, [gameId, session?.user?.id])

  useEffect(() => {
    fetchGameState()
    const interval = setInterval(fetchGameState, 2000) // Poll every 2 seconds
    return () => clearInterval(interval)
  }, [fetchGameState])

  function onDrop(sourceSquare: string, targetSquare: string) {
    if (isGameOver || !gameId) return false

    const gameCopy = new Chess(game.fen())
    
    try {
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // always promote to queen for simplicity
      })
  
      if (move) {
        setGame(gameCopy)
        sendMoveToServer(move)
        return true
      }
    } catch (error) {
      console.error('Invalid move:', error)
      setError('Invalid move. Please try again.')
    }
    
    return false
  }

  async function sendMoveToServer(move: any) {
    try {
      const response = await fetch(`/api/game/play/${gameId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ move: move.san }),
      })

      if (response.ok) {
        const updatedGame = await response.json()
        if (updatedGame.winner) {
          setIsGameOver(true)
          // Handle game over (e.g., show a modal)
        }
        setError(null)  // Clear any previous errors
      } else {
        console.error('Server rejected move:', await response.text())
        setError('Server rejected the move. Please try again.')
        // Rollback the move if server rejected it
        setGame(new Chess(game.fen()))
      }
    } catch (error) {
      console.error('Error sending move to server:', error)
      setError('Error sending move to server. Please try again.')
      // Rollback the move if there was an error
      setGame(new Chess(game.fen()))
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Chessboard
        position={game.fen()}
        onPieceDrop={onDrop}
        boardOrientation={orientation}
      />
      {isGameOver && <div className="mt-4 text-center font-bold">Game Over</div>}
      {error && <div className="mt-4 text-center text-red-500">{error}</div>}
    </div>
  )
}