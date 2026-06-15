'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BACKEND_URL } from '@/constants/apiConstants'

export default function AdminLoginPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')

      localStorage.setItem('token', data.token)
      router.push('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8 md:py-12">
      <div className="paper-card p-6 md:p-10 animate-slide-down">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#1b2126]">Admin Sign In</h2>
          <p className="mt-1 text-sm text-[#4f5964]">Use your admin credentials to continue.</p>
        </div>

        <p aria-live="polite" className={error ? 'status-note mb-5 text-sm' : 'sr-only'}>
          {error || 'No errors'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="adminName" className="mb-2 block text-sm font-semibold text-[#1b2126]">
              Full Name
            </label>
            <input
              id="adminName"
              name="name"
              autoComplete="name"
              spellCheck={false}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="field"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="adminPassword" className="mb-2 block text-sm font-semibold text-[#1b2126]">
              Password
            </label>
            <div className="relative">
              <input
                id="adminPassword"
                name="current-password"
                autoComplete="current-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="field pr-16"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-accent hover:text-accent-strong focus:outline-none"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button type="submit" className="pill-btn pill-btn-primary w-full" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In As Admin'}
          </button>
        </form>
      </div>
    </section>
  )
}
