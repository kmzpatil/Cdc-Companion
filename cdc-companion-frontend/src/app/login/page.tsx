'use client'

import { FormEvent, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BACKEND_URL } from '@/constants/apiConstants'

export default function ReviewerLoginPage() {
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
    <section className="animate-fade-in mx-auto w-full max-w-[95%] px-4 py-8 md:px-8 md:py-10">
      <header className="animate-slide-down w-full flex flex-col sm:flex-row items-center justify-between py-4 sm:py-6 px-4 mb-6 sm:mb-8 gap-3 sm:gap-0 bg-transparent text-center sm:text-left">
        <div className="flex items-center gap-3 w-full justify-center sm:justify-start">
          <Image
            src="/CQ LOGO white.png"
            alt="Communiqué Logo"
            width={240}
            height={75}
            className="w-[80%] sm:w-auto h-auto max-w-[240px] object-contain"
          />
        </div>
        <div>
          <span className="text-lg sm:text-2xl font-black tracking-widest text-white font-mono uppercase bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            CDC Companion
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <aside className="paper-card animate-slide-up lg:col-span-2 p-6 md:p-8 flex flex-col justify-between lg:h-full h-fit border-l-4 border-l-accent transition-all duration-500 hover:border-l-indigo-400 shadow-[0_0_40px_-10px_rgba(59,130,246,0.2)] hover:shadow-[0_0_55px_-5px_rgba(139,92,246,0.4)] order-last lg:order-none">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-accent">Reviewer Access</p>
            <h1 className="mb-3 text-3xl font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 tracking-tight">
              Review CV Submissions
            </h1>
            <p className="text-sm text-[#4f5964]">
              Sign in to view assigned candidates, provide structured feedback, and track completion progress.
            </p>
          </div>
          <div className="mt-6 pt-6 border-t border-border flex flex-col gap-2.5 w-full">
            <Link href="/" className="pill-btn pill-btn-primary w-full text-center block shadow-sm !text-[10px] sm:!text-xs !py-2 sm:!py-2.5 font-bold">
              Back to Home
            </Link>
          </div>
        </aside>

        <div className="paper-card animate-slide-down lg:col-span-3 p-6 md:p-10 order-first lg:order-none">
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
            <div className="relative">
              <input
                id="reviewerPassword"
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
            {isLoading ? 'Signing In...' : 'Sign In As Reviewer'}
          </button>
        </form>
      </div>
      </div>
    </section>
  )
}
