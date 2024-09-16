'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import LoginForm from '@/components/Auth/LoginForm'
import RegisterForm from '@/components/Auth/RegisterForm'

export default function Home() {
  const [isLogin, setIsLogin] = useState(true)
  const { data: session } = useSession()
  const router = useRouter()

  if (session) {
    router.push('/game')
    return null
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Welcome to Multiplayer Chess</h1>
      {isLogin ? <LoginForm /> : <RegisterForm />}
      <p className="mt-4 text-center">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-500 hover:underline"
        >
          {isLogin ? "Register" : "Login"}
        </button>
      </p>
    </div>
  )
}