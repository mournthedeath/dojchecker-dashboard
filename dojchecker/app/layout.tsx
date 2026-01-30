import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DOJChecker Dashboard',
  description: 'Roblox forensic analysis tool',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-black text-white">
          <header className="border-b border-gray-800 p-4">
            <h1 className="text-2xl font-bold">DOJChecker</h1>
            <p className="text-gray-400">Roblox Forensic Scanner</p>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}