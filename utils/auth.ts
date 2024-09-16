import { hash } from 'bcryptjs'
import User, { SafeUser, toSafeUser, IUser } from '@/models/User'
import dbConnect from '@/lib/mongodb'

export async function registerUser(name: string, email: string, password: string): Promise<SafeUser> {
  await dbConnect()

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new Error('User already exists')
  }

  const hashedPassword = await hash(password, 12)

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
  })

  await newUser.save()

  return toSafeUser(newUser)
}

export async function getUserById(id: string): Promise<SafeUser | null> {
  await dbConnect()

  const user = await User.findById(id)

  if (!user) {
    return null
  }

  return toSafeUser(user)
}

export async function getUserByEmail(email: string): Promise<IUser | null> {
  await dbConnect()

  return User.findOne({ email })
}