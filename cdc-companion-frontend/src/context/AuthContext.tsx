// src/contexts/AuthContext.tsx
'use client'

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react'
import { BACKEND_URL } from '../constants/apiConstants'

interface User {
  id: string                // UUID
  name: string
  role: 'USER' | 'SELLER' | 'ADMIN'
  email: string
  countryCode: string
  phoneNumber: string
  address: string
  profileImage: string
  verificationDocument: string
  isDocumentVerified: 'APPROVED' | 'PENDING' | 'REJECTED'
  isEmailVerified: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  authFetch: typeof fetch
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  // load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('auth')
    if (stored) {
      const { token: t, user: u } = JSON.parse(stored)
      setToken(t)
      setUser(u)
    }
  }, [])

  // wrapper around fetch to inject Bearer
  const authFetch: typeof fetch = (input, init = {}) => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null)
    return fetch(input, {
      ...init,
      headers: {
        ...(init.headers || {}),
        Authorization: activeToken ? `Bearer ${activeToken}` : '',
      },
    })
  }

  // attempt login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) return false

      const { token: jwt, user: u } = await res.json()
      // u should include all needed User fields except email
      const me: User = { ...u, email }

      setToken(jwt)
      setUser(me)
      localStorage.setItem('auth', JSON.stringify({ token: jwt, user: me }))
      return true
    } catch (err) {
      console.error('Login failed', err)
      return false
    }
  }

  // clear everything
  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('auth')
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    login,
    logout,
    authFetch,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
