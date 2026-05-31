'use client'

import { FormEvent, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { BACKEND_URL } from '@/constants/apiConstants'

export default function ReviewerLoginPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch(`${BACKEND_URL}/api/reviewer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')

      localStorage.setItem('token', data.token)
      router.push('/reviewer')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="animate-fade-in mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 gap-8 px-4 py-8 md:grid-cols-5 md:px-8 md:py-12">
      <aside className="paper-card animate-slide-up md:col-span-2 p-6 md:p-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-accent">Reviewer Access</p>
        <h1 className="mb-3 text-3xl font-black leading-tight text-[#1b2126]">Review CV Submissions With Confidence</h1>
        <p className="mb-6 text-sm text-[#4f5964]">
          Sign in to view assigned candidates, provide structured feedback, and track completion progress.
        </p>
        <div className="animate-scale-in overflow-hidden rounded-2xl border border-border bg-surface-strong">
          <Image
            src="/banner.png"
            alt="CDC Companion Banner"
            width={1200}
            height={460}
            priority
            className="h-auto w-full"
          />
        </div>
      </aside>

      <div className="paper-card animate-slide-down md:col-span-3 p-6 md:p-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#1b2126]">Sign In</h2>
          <p className="mt-1 text-sm text-[#4f5964]">Use your reviewer credentials to continue.</p>
        </div>

        <p aria-live="polite" className={error ? 'status-note mb-5 text-sm' : 'sr-only'}>
          {error || 'No errors'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="reviewerName" className="mb-2 block text-sm font-semibold text-[#1b2126]">
              Full Name
            </label>
            <input
              id="reviewerName"
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
            <label htmlFor="reviewerPassword" className="mb-2 block text-sm font-semibold text-[#1b2126]">
              Password
            </label>
            <input
              id="reviewerPassword"
              name="current-password"
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="field"
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="pill-btn pill-btn-primary w-full" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In As Reviewer'}
          </button>
        </form>
      </div>
    </section>
  )
}
