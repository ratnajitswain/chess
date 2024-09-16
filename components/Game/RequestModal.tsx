import { useState } from 'react'
import { useSession } from 'next-auth/react'

interface RequestModalProps {
  onClose: () => void
  onGameStart: (gameId: string) => void
}

export default function RequestModal({ onClose, onGameStart }: RequestModalProps) {
  const { data: session } = useSession()
  const [opponent, setOpponent] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!session?.user?.id) {
      setError('You must be logged in to create a game')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/game/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          opponentEmail: opponent,
          playerId: session.user.id
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onGameStart(data.gameId)
        onClose()
      } else {
        setError(data.message || 'Failed to create game request')
      }
    } catch (error) {
      console.error('Error creating game request:', error)
      setError('An error occurred while creating the game request')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-2xl font-semibold mb-4">Start New Game</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="opponent" className="block mb-1">Opponent's Email</label>
            <input
              type="email"
              id="opponent"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded text-black"
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}