import { FaGithub } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-secondary text-white">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <p>&copy; 2024 Multiplayer Chess. All rights reserved.</p>
        <a href="https://github.com/ratnajitswain/chess" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
          <FaGithub className="text-xl" />
          <span>Source Code</span>
        </a>
      </div>
    </footer>
  )
}