'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Board from '@/components/Game/Board'
import Chat from '@/components/Game/Chat'
import GameInfo from '@/components/Game/GameInfo'
import RequestModal from '@/components/Game/RequestModal'

export default function GamePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [gameId, setGameId] = useState<string | null>(null)
  const [showRequestModal, setShowRequestModal] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  useEffect(()=>{

    const fetchRequests = async () => {
        if(gameId){
            return clearInterval(interval)
        }
        const response = await fetch(`/api/game/requests`)
        if (response.ok) {
          const fetchedRequests = await response.json()
          if(fetchedRequests?.requests?.[0]){
            clearInterval(interval)
            if(confirm('There is a game request')){
            const response = await fetch('/api/game/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    requestId: fetchedRequests.requests[0]?.id
                }),
              })
              let gameData = await response.json()
            setGameId(gameData.gameId)
            }
          }
          
        }
      }

      fetchRequests()

    const interval = setInterval(fetchRequests, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  },[])

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
      <div className="w-full md:w-2/3">
        <Board gameId={gameId} />
      </div>
      <div className="w-full md:w-1/3 space-y-4">
        <GameInfo gameId={gameId} />
        <Chat gameId={gameId} />
        {!gameId && (
          <button
            onClick={() => setShowRequestModal(true)}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Start New Game
          </button>
        )}
      </div>
      {showRequestModal && (
        <RequestModal
          onClose={() => setShowRequestModal(false)}
          onGameStart={(id) => setGameId(id)}
        />
      )}
    </div>
  )
}