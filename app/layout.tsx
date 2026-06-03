import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Email Tone Analyzer',
  description: 'Analyze your email tone patterns and compose contextual emails',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}