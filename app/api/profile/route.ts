'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import ProfileCard from '@/components/Profile/ProfileCard'
import { SafeGame } from '@/models/Game'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [games, setGames] = useState<SafeGame[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    } else if (status === 'authenticated') {
      fetchGames()
    }
  }, [status, router])

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/profile/games')
      if (response.ok) {
        const data = await response.json()
        setGames(data.games)
      }
    } catch (error) {
      console.error('Failed to fetch games:', error)
    }
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="space-y-8">
      <ProfileCard user={session.user} />
      <div>
        <h2 className="text-2xl font-semibold mb-4">Game History</h2>
        {games.length > 0 ? (
          <ul className="space-y-4">
            {games.map((game) => (
              <li key={game.id} className="bg-white shadow rounded-lg p-4">
                <p><span className="font-semibold">White:</span> {game.whitePlayer}</p>
                <p><span className="font-semibold">Black:</span> {game.blackPlayer}</p>
                <p><span className="font-semibold">Winner:</span> {game.winner || 'In progress'}</p>
                <p><span className="font-semibold">Start Time:</span> {new Date(game.startTime).toLocaleString()}</p>
                {game.endTime && <p><span className="font-semibold">End Time:</span> {new Date(game.endTime).toLocaleString()}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p>No games played yet.</p>
        )}
      </div>
    </div>
  )
}