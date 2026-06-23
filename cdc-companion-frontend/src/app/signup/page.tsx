'use client'

import { FormEvent, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BACKEND_URL } from '@/constants/apiConstants'

const PROFILES = [
  { key: 'Software', value: 'SOFTWARE' },
  { key: 'Data', value: 'DATA' },
  { key: 'Finance', value: 'FINANCE' },
  { key: 'Quant', value: 'QUANT' },
  { key: 'Consult', value: 'CONSULT' },
  { key: 'Core', value: 'CORE' },
  { key: 'Product/FMCG', value: 'PRODUCT_FMCG' },
]

export default function ReviewerSignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    email: '',
    contactNumber: '',
    reviewsNumber: 5,
    selectedProfiles: [] as string[],
    interestedInMockInterview: null as boolean | null,
    queries: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string | number | string[] | boolean | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleProfileChange = (profileValue: string) => {
    setFormData((prev) => {
      const alreadySelected = prev.selectedProfiles.includes(profileValue)
      const updated = alreadySelected
        ? prev.selectedProfiles.filter((p) => p !== profileValue)
        : [...prev.selectedProfiles, profileValue]
      return { ...prev, selectedProfiles: updated }
    })
  }

  const validateForm = () => {
    const { name, rollNo, email, contactNumber, selectedProfiles } = formData

    if (!name.trim() || !rollNo.trim() || !email.trim() || !contactNumber.trim()) {
      setError('Please fill all required fields.')
      return false
    }

    // Roll Number validation: must be 23XX1... (2023 batch) or 22XX3... (2022 batch)
    const reviewerRollRegex = /^(?:23[A-Za-z]{2}1|22[A-Za-z]{2}3)/
    if (!reviewerRollRegex.test(rollNo.trim())) {
      setError('Please recheck your Roll Number.')
      return false
    }

    if (selectedProfiles.length === 0) {
      setError('Please select at least one target profile.')
      return false
    }

    if (formData.interestedInMockInterview === null) {
      setError('Please answer if you are interested in becoming an interviewer.')
      return false
    }

    return true
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) return

    setIsLoading(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/reviewer/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          rollNo: formData.rollNo.trim().toUpperCase(),
          email: formData.email.trim(),
          contactNumber: formData.contactNumber.trim(),
          profiles: formData.selectedProfiles,
          reviewsNumber: formData.reviewsNumber,
          interestedInMockInterview: formData.interestedInMockInterview,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Signup failed')

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <section className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-4 py-8">
        <div className="paper-card w-full p-8 text-center animate-scale-in">
          <div className="mb-4 text-emerald-500 text-5xl">✓</div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-accent">Registration Complete</p>
          <h1 className="mb-3 text-3xl font-black text-[#1b2126]">Welcome Aboard!</h1>
          <p className="mx-auto mb-6 max-w-md text-sm text-[#4f5964]">
            Thank you for volunteering as a CV Reviewer for the CV Review Drive. Your contribution is highly valued by the students.
          </p>
          <div className="rounded-2xl border border-border bg-surface-strong p-6 mb-6 text-left space-y-2">
            <h3 className="font-bold text-[#1b2126]">Your Login Details:</h3>
            <p className="text-sm text-[#4f5964]"><strong className="text-[#1b2126]">Institute Email ID:</strong> {formData.email}</p>
            <p className="text-sm text-[#4f5964]"><strong className="text-[#1b2126]">Password:</strong> {formData.rollNo.toUpperCase()} (Your Roll Number)</p>
          </div>
          <Link href="/login" className="pill-btn pill-btn-primary px-8">
            Go to Reviewer Login
          </Link>
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-7">
        <aside className="animate-slide-up lg:col-span-2 p-0 lg:p-8 flex flex-col justify-between lg:h-full h-fit border-0 lg:border-l-4 border-l-accent transition-all duration-500 hover:border-l-indigo-400 lg:paper-card bg-transparent shadow-none lg:shadow-[0_0_40px_-10px_rgba(59,130,246,0.2)] lg:hover:shadow-[0_0_55px_-5px_rgba(139,92,246,0.4)]">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-accent">CV Review Drive</p>
            <h1 className="mb-3 text-2xl lg:text-3xl font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 tracking-tight">
              CV Review 2026 | Communiqué
            </h1>
            <p className="text-sm text-[#4f5964] mb-6">
              As CDC season approaches, we are organizing events to guide students, and your expertise would greatly benefit them. We would be delighted if you could participate as a CV Reviewer in the CV Review Drive and review 3-5 student CVs to help refine their applications.
            </p>
            <p className="text-xs text-[#4f5964] italic">
              *Tentative date for CV Review is 16th June onwards.
            </p>
          </div>
        </aside>

        <div className="paper-card animate-slide-down lg:col-span-5 p-6 md:p-10 text-[90%]">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#1b2126]">Reviewer Registration</h2>
            <p className="mt-1 text-sm text-[#4f5964]">Kindly fill in the details below to participate as a CV Reviewer.</p>
          </div>

          <p aria-live="polite" className={error ? 'status-note mb-5 text-sm' : 'sr-only'}>
            {error || 'No errors'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="name" className="mb-2 block text-[13px] font-semibold text-[#1b2126]">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="field"
                placeholder="Enter your full name"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="rollNo" className="mb-2 block text-[13px] font-semibold text-[#1b2126]">
                  Roll Number *
                </label>
                <input
                  id="rollNo"
                  name="rollNo"
                  type="text"
                  value={formData.rollNo}
                  onChange={(e) => handleInputChange('rollNo', e.target.value)}
                  required
                  className="field"
                  placeholder="Example: 21CS10001"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-[13px] font-semibold text-[#1b2126]">
                  Institute Email ID *
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="field"
                    placeholder="example@kgpian.iitkgp.ac.in"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="contactNumber" className="mb-2 block text-[13px] font-semibold text-[#1b2126]">
                Contact Number *
              </label>
              <input
                id="contactNumber"
                name="contactNumber"
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                required
                className="field"
                placeholder="Enter your mobile number"
              />
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-semibold text-[#1b2126]">
                Please select the profile(s) you would like to review CVs for: *
              </label>
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl border border-border bg-surface-strong">
                {PROFILES.map((profile) => {
                  const isChecked = formData.selectedProfiles.includes(profile.value)
                  return (
                    <label key={profile.value} className="flex items-center gap-3 cursor-pointer py-1.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleProfileChange(profile.value)}
                        className="h-4 w-4 cursor-pointer rounded border-border text-accent focus:ring-accent"
                      />
                      <span className="text-sm font-medium text-[#4f5964]">{profile.key}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-semibold text-[#1b2126]">
                Are you interested in becoming an interviewer in the Mock Interviewer Drive? *
              </label>
              <div className="flex gap-4 p-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="interestedInMockInterview"
                    checked={formData.interestedInMockInterview === true}
                    onChange={() => handleInputChange('interestedInMockInterview', true)}
                    className="h-4 w-4 border-border text-accent focus:ring-accent"
                  />
                  <span className="text-sm font-medium text-[#4f5964]">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="interestedInMockInterview"
                    checked={formData.interestedInMockInterview === false}
                    onChange={() => handleInputChange('interestedInMockInterview', false)}
                    className="h-4 w-4 border-border text-accent focus:ring-accent"
                  />
                  <span className="text-sm font-medium text-[#4f5964]">No</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="reviewsNumber" className="mb-2 block text-[13px] font-semibold text-[#1b2126]">
                How many CVs will you be willing to review?
              </label>
              <input
                id="reviewsNumber"
                name="reviewsNumber"
                type="number"
                min={1}
                max={20}
                value={formData.reviewsNumber}
                onChange={(e) => handleInputChange('reviewsNumber', Number(e.target.value))}
                required
                className="field"
              />
            </div>

            <div>
              <label htmlFor="queries" className="mb-2 block text-[13px] font-semibold text-[#1b2126]">
                Any queries for us? (Optional)
              </label>
              <textarea
                id="queries"
                name="queries"
                rows={3}
                value={formData.queries}
                onChange={(e) => handleInputChange('queries', e.target.value)}
                className="field resize-none py-2"
                placeholder="Write any questions or comments here..."
              />
            </div>

            <button type="submit" className="pill-btn pill-btn-primary w-full" disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Register as CV Reviewer'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
