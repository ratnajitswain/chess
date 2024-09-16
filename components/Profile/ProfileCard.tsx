import { FaUser } from 'react-icons/fa'

interface ProfileCardProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export default function ProfileCard({ user }: ProfileCardProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center space-x-4">
        <div className="bg-gray-200 rounded-full p-3">
          <FaUser className="text-4xl text-gray-600" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
        </div>
      </div>
      {/* Add more user information or stats here */}
    </div>
  )
}