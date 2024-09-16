import { NextResponse } from 'next/server'
import { registerUser } from '@/utils/auth'
export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    const user = await registerUser(name, email, password)

    return NextResponse.json({ user }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Registration failed' }, { status: 400 })
  }
}