import './globals.css'
import { Inter } from 'next/font/google'
import Header from '@/components/Layout/Header'
import Footer from '@/components/Layout/Footer'
import { Providers } from './Provides'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Multiplayer Chess | Ratnajit',
  description: 'A multiplayer chess game built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex flex-col min-h-screen text-black">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}