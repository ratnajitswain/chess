import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface ChatProps {
  gameId: string | null
}

interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
}

export default function Chat({ gameId }: ChatProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    if (gameId) {
      const fetchMessages = async () => {
        const response = await fetch(`/api/game/play/${gameId}/messages`)
        if (response.ok) {
          const fetchedMessages = await response.json()
          setMessages(fetchedMessages)
        }
      }

      fetchMessages()
      const interval = setInterval(fetchMessages, 5000) // Poll every 5 seconds

      return () => clearInterval(interval)
    }
  }, [gameId])

  const sendMessage = async () => {
    if (!newMessage.trim() || !gameId || !session) return

    await fetch(`/api/game/play/${gameId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newMessage }),
    })

    setNewMessage('')
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Chat</h2>
      <div className="h-64 overflow-y-auto mb-4">
        {messages.map((message) => (
          <div key={message.id} className="mb-2">
            <span className="font-semibold">{message.sender}: </span>
            <span>{message.content}</span>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow px-3 py-2 border rounded-l"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded-r"
        >
          Send
        </button>
      </div>
    </div>
  )
}