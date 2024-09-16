"use client"
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { FaChess } from 'react-icons/fa'

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="bg-primary text-white">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <FaChess className="text-2xl" />
          <span className="text-xl font-bold">Multiplayer Chess</span>
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li><Link href="/">Home</Link></li>
            {session ? (
              <>
                <li><Link href="/game">Play</Link></li>
                <li><Link href="/profile">Profile</Link></li>
                <li><button onClick={() => signOut()}>Logout</button></li>
              </>
            ) : (
              <li><Link href="/">Login</Link></li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}