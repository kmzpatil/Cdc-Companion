import './globals.css'
import { AuthProvider } from '../context/AuthContext'
import { Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata = {
  title: 'Communiqué | CDC Companion',
  description: 'CDC Companion CV submission and review portal.',
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport = {
  themeColor: '#f6f6ef',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} ${spaceGrotesk.variable} aurora-bg font-sans`}>
        <a href="#main-content" className="skip-link">Skip To Main Content</a>
        <AuthProvider>
          <main id="main-content">{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
