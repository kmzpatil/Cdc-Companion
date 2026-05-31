'use client'

import { FormEvent, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BACKEND_URL } from '@/constants/apiConstants'

const PROFILES = [
  { key: 'Core', value: 'Core' },
  { key: 'Consult', value: 'Consult' },
  { key: 'Data', value: 'Data' },
  { key: 'Finance/Quant', value: 'Finance/Quant' },
  { key: 'Product/FMCG', value: 'Product/FMCG' },
  { key: 'Software', value: 'Software' },
]

const EMAIL_REGEX = /^[^@]+@kgpian\.iitkgp\.ac\.in$/
const ROLL_REGEX = /^(?:23[A-Za-z]{2}3.*|24[A-Za-z]{2}1.*)$/

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

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    const { fullName, email, rollNo, password, cvLink, hasGrantedAccess } = formData

    if (!fullName || !email || !rollNo || !password || !cvLink) {
      setError('Please fill all required fields.')
      return false
    }

    if (!EMAIL_REGEX.test(email)) {
      setError('Email must end with @kgpian.iitkgp.ac.in')
      return false
    }

    if (!ROLL_REGEX.test(rollNo.trim())) {
      setError('Roll must start with 23XX3 or 24XX1, where XX are letters.')
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
          <a
            href="https://prepnest.in/?refercode=PrepGrow-sahib-singhprepgrowthpartner-02"
            target="_blank"
            rel="noopener noreferrer"
            className="pill-btn pill-btn-primary"
          >
            Explore PrepNest
          </a>
          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface-strong">
            <Image
              src="/prepnest.jpg"
              alt="PrepNest Preview"
              width={1120}
              height={760}
              loading="lazy"
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="animate-fade-in mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-10">
      <div className="animate-slide-down mb-8 max-w-[50%] mx-auto">
        <Image
          src="/banner.png"
          alt="CDC Companion Banner"
          width={1800}
          height={690}
          priority
          className="h-auto w-full rounded-2xl"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <aside className="paper-card animate-slide-up lg:col-span-2 p-6 md:p-8 flex flex-col justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-accent">CDC Companion</p>
            <h1 className="mb-3 text-3xl font-black text-[#1b2126]">Submit Your CV For Review</h1>
            <p className="text-sm text-[#4f5964]">
              Get structured feedback from experienced seniors to improve role alignment, readability, and impact.
            </p>
          </div>
          <div className="mt-6 pt-6 border-t border-border space-y-3">
            <Link href="/reviewee" className="pill-btn pill-btn-primary w-full text-center block shadow-sm">
              Check Review Status
            </Link>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/login/reviewer" className="pill-btn pill-btn-secondary !text-xs !py-2.5 text-center w-full block font-bold">
                Reviewer Login
              </Link>
              <Link href="/login/admin" className="pill-btn pill-btn-secondary !text-xs !py-2.5 text-center w-full block font-bold">
                Admin Login
              </Link>
            </div>
          </div>
        </aside>

        <div className="paper-card animate-slide-up lg:col-span-3 p-6 md:p-8">
          <p aria-live="polite" className={error ? 'status-note mb-5 text-sm' : 'sr-only'}>
            {error || 'No errors'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-semibold text-[#1b2126]">
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
                <label htmlFor="rollNo" className="mb-2 block text-sm font-semibold text-[#1b2126]">
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
                  placeholder="Example: 22AB3XXX"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#1b2126]">
                  Institute Email
                </label>
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

            <div>
              <label htmlFor="cvLink" className="mb-2 block text-sm font-semibold text-[#1b2126]">
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
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#1b2126]">
                Review Status Checking Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                className="field"
                placeholder="Choose a password to check status later"
              />
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
              <label htmlFor="profile" className="mb-2 block text-sm font-semibold text-[#1b2126]">
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
        </div>
      </div>
    </section>
  )
}
