'use client'

import { FormEvent, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BACKEND_URL } from '@/constants/apiConstants'

const PROFILES = [
  { key: 'Select Target Profile', value: '' },
  { key: 'Core', value: 'Core' },
  { key: 'Consult', value: 'Consult' },
  { key: 'Data', value: 'Data' },
  { key: 'Finance', value: 'Finance' },
  { key: 'Quant', value: 'Quant' },
  { key: 'Product/FMCG', value: 'Product/FMCG' },
  { key: 'Software', value: 'Software' },
]

const EMAIL_REGEX = /^[^@]+@kgpian\.iitkgp\.ac\.in$/
const ROLL_REGEX = /^(?:23[A-Za-z]{2}.*|24[A-Za-z]{2}.*)$/

interface FormData {
  fullName: string
  email: string
  rollNo: string
  password: string
  cvLink: string
  profile: string
  hasGrantedAccess: boolean
}

interface SubmissionData {
  name: string
  rollNo: string
  email: string
  password: string
  cvLink: string
  profile: string
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    rollNo: '',
    password: '',
    cvLink: '',
    profile: PROFILES[0].value,
    hasGrantedAccess: false,
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    const { fullName, email, rollNo, password, cvLink, profile, hasGrantedAccess } = formData

    if (!fullName || !email || !rollNo || !password || !cvLink || !profile) {
      setError('Please fill all required fields and select a target profile.')
      return false
    }

    if (!EMAIL_REGEX.test(email)) {
      setError('Email must end with @kgpian.iitkgp.ac.in')
      return false
    }

    if (!ROLL_REGEX.test(rollNo.trim())) {
      setError('Roll must start with 23XX or 24XX, where XX are letters.')
      return false
    }

    if (!cvLink.includes('drive.google.com') && !cvLink.includes('docs.google.com')) {
      setError('Please submit a valid Google Drive or Google Docs link.')
      return false
    }

    if (!hasGrantedAccess) {
      setError('You must confirm that view access has been granted to your Google Drive link.')
      return false
    }

    return true
  }

  const submitApplication = async (data: SubmissionData) => {
    const res = await fetch(`${BACKEND_URL}/api/reviewee/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const json = await res.json()
    if (!res.ok) {
      throw new Error(json.error || 'Submission failed')
    }

    return json
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) return

    setIsLoading(true)
    try {
      await submitApplication({
        name: formData.fullName,
        rollNo: formData.rollNo,
        email: formData.email,
        password: formData.password,
        cvLink: formData.cvLink,
        profile: formData.profile,
      })
      localStorage.setItem('revieweeEmail', formData.email)
      setShowConfirmation(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (showConfirmation) {
    return (
      <section className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-8 md:px-8">
        <div className="paper-card w-full p-6 text-center md:p-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-accent">Submission Received</p>
          <h1 className="mb-3 text-3xl font-black text-[#1b2126]">CV Submitted Successfully</h1>
          <p className="mx-auto mb-6 max-w-xl text-sm text-[#4f5964]">
            Thank you for submitting your CV. You will get notified once your review is complete.
          </p>
          <div className="flex justify-center mb-6">
            <button
              onClick={() => {
                setShowConfirmation(false)
                setFormData({
                  fullName: '',
                  email: '',
                  rollNo: '',
                  password: '',
                  cvLink: '',
                  profile: PROFILES[0].value,
                  hasGrantedAccess: false,
                })
              }}
              className="pill-btn pill-btn-primary w-full sm:w-auto"
            >
              Go Back
            </button>
          </div>
        </div>
      </section>
    )
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
        <aside className="animate-slide-up lg:col-span-2 p-0 lg:p-8 flex flex-col justify-between lg:h-full h-fit border-0 lg:border-l-4 border-l-accent transition-all duration-500 hover:border-l-indigo-400 lg:paper-card bg-transparent shadow-none lg:shadow-[0_0_40px_-10px_rgba(59,130,246,0.2)] lg:hover:shadow-[0_0_55px_-5px_rgba(139,92,246,0.4)]">
          <div>
            <h1 className="mb-3 text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 tracking-tight leading-tight">
              Submit Your CV For Review
            </h1>
            <p className="text-sm text-[#4f5964] mb-4 lg:mb-6">
              Get structured feedback from experienced seniors to improve role alignment, readability, and impact.
            </p>
            <div className="hidden sm:block space-y-4 text-xs text-[#4f5964] border-t border-border pt-4">
              <div className="flex gap-3 items-start animate-fade-in [animation-delay:150ms]">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                <p><strong>Detailed Feedback:</strong> Receive structured feedback on format, relevance, clarity, language, and projects.</p>
              </div>
              <div className="flex gap-3 items-start animate-fade-in [animation-delay:250ms]">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                <p><strong>Profile-Specific Matching:</strong> Get reviewed by seniors specialized in your target track (Software, Finance, Consult, Core, Data, Product).</p>
              </div>
              <div className="flex gap-3 items-start animate-fade-in [animation-delay:350ms]">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                <p><strong>Senior Advice:</strong> Benefit from the experience of seniors who successfully navigated the CDC placement cycles.</p>
              </div>
              <div className="flex gap-3 items-start animate-fade-in [animation-delay:450ms]">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                <p><strong>Secure Status Access:</strong> Keep your checking password safe to view reviewer comments anonymously as soon as they are submitted.</p>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border hidden lg:flex flex-col gap-3 w-full">
            <Link href="/reviewee" className="pill-btn pill-btn-primary w-full text-center block shadow-sm font-bold">
              Check Review Status
            </Link>
            <div className="grid grid-cols-2 gap-3 w-full">
              <Link href="/login/reviewer" className="pill-btn pill-btn-secondary text-center block font-bold">
                Reviewer Login
              </Link>
              <Link href="/login/admin" className="pill-btn pill-btn-secondary text-center block font-bold">
                Admin Login
              </Link>
            </div>
          </div>
        </aside>

        <div className="paper-card animate-slide-up lg:col-span-3 p-6 md:p-8 text-[90%]">
          <p aria-live="polite" className={error ? 'status-note mb-5 text-sm' : 'sr-only'}>
            {error || 'No errors'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="fullName" className="mb-2 block text-[13px] font-semibold text-[#1b2126]">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                autoComplete="name"
                spellCheck={false}
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                required
                className="field"
                placeholder="Enter your full name"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="rollNo" className="mb-2 block text-[13px] font-semibold text-[#1b2126]">
                  Roll Number
                </label>
                <input
                  id="rollNo"
                  name="rollNo"
                  autoComplete="off"
                  spellCheck={false}
                  type="text"
                  value={formData.rollNo}
                  onChange={(e) => handleInputChange('rollNo', e.target.value)}
                  required
                  className="field"
                  placeholder="Example: 23AB3XXXX"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-[13px] font-semibold text-[#1b2126]">
                  Institute Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    autoComplete="email"
                    spellCheck={false}
                    inputMode="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="field"
                    placeholder="name@kgpian.iitkgp.ac.in"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="cvLink" className="mb-2 block text-[13px] font-semibold text-[#1b2126]">
                Google Drive Link to Your CV (PDF)
              </label>
              <input
                id="cvLink"
                name="cvLink"
                type="url"
                value={formData.cvLink}
                onChange={(e) => handleInputChange('cvLink', e.target.value)}
                required
                className="field"
                placeholder="https://drive.google.com/file/d/.../view"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-[13px] font-semibold text-[#1b2126]">
                Review Status Checking Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  className="field pr-16 sm:pr-20"
                  placeholder="Enter checking password"
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

            <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-strong p-4">
              <input
                id="hasGrantedAccess"
                name="hasGrantedAccess"
                type="checkbox"
                checked={formData.hasGrantedAccess}
                onChange={(e) => handleInputChange('hasGrantedAccess', e.target.checked)}
                className="mt-1 h-4 w-4 cursor-pointer rounded border-border text-accent focus:ring-accent"
              />
              <label htmlFor="hasGrantedAccess" className="cursor-pointer text-xs font-semibold leading-relaxed text-[#4f5964]">
                Acknowledgment: I confirm that I have set the Google Drive sharing settings of my CV to &quot;Anyone with the link can view&quot; so that reviewers can access it.
              </label>
            </div>

            <div>
              <label htmlFor="profile" className="mb-2 block text-[13px] font-semibold text-[#1b2126]">
                Target Profile
              </label>
              <select
                id="profile"
                name="profile"
                value={formData.profile}
                onChange={(e) => handleInputChange('profile', e.target.value)}
                className="field"
              >
                {PROFILES.map((profile) => (
                  <option key={profile.key} value={profile.value}>
                    {profile.key}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="pill-btn pill-btn-primary w-full" disabled={isLoading}>
              {isLoading ? 'Submitting CV...' : 'Submit CV For Review'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border flex lg:hidden flex-col gap-3 w-full animate-fade-in">
            <Link href="/reviewee" className="pill-btn pill-btn-primary w-full text-center block shadow-sm font-bold">
              Check Review Status
            </Link>
            <div className="grid grid-cols-2 gap-3 w-full">
              <Link href="/login/reviewer" className="pill-btn pill-btn-secondary text-center block font-bold">
                Reviewer Login
              </Link>
              <Link href="/login/admin" className="pill-btn pill-btn-secondary text-center block font-bold">
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
