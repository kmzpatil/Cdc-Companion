'use client'

import { useEffect, useState, FormEvent } from 'react'
import Link from 'next/link'
import { BACKEND_URL } from '@/constants/apiConstants'

interface RevieweeSubmission {
  id: number
  name: string
  email: string
  rollNo: string
  profile: string
  cvLink: string
  submissionTime: string
  status: boolean
}

interface ReviewFeedback {
  id: number
  comments: string[]
  submissionTime: string
  reviewer: {
    name: string
    id: number
  }
}

const EMAIL_REGEX = /^[^@]+@kgpian\.iitkgp\.ac\.in$/

export default function RevieweeDashboardPage() {
  const [emailInput, setEmailInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [submission, setSubmission] = useState<RevieweeSubmission | null>(null)
  const [feedback, setFeedback] = useState<ReviewFeedback | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [showPDF, setShowPDF] = useState(true)

  const fetchSubmission = async (targetEmail: string, targetPassword?: string) => {
    setLoading(true)
    setSearchError(null)
    try {
      const activePassword = targetPassword || passwordInput || localStorage.getItem('revieweePassword') || ''
      if (!activePassword) {
        throw new Error('Password is required to check status.')
      }

      const res = await fetch(`${BACKEND_URL}/api/reviewee/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: targetEmail, password: activePassword }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to retrieve submission details.')
      }

      const data: { submission: RevieweeSubmission; feedback?: ReviewFeedback } = await res.json()
      setSubmission(data.submission)
      if (data.feedback) {
        setFeedback(data.feedback)
      } else {
        setFeedback(null)
      }
      localStorage.setItem('revieweeEmail', targetEmail)
      localStorage.setItem('revieweePassword', activePassword)
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'An unexpected error occurred.')
      setSubmission(null)
      setFeedback(null)
    } finally {
      setLoading(false)
    }
  }

  // Retrieve email and password from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem('revieweeEmail')
      const storedPassword = localStorage.getItem('revieweePassword')
      if (storedEmail && storedPassword) {
        void fetchSubmission(storedEmail, storedPassword)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const emailTrim = emailInput.trim()
    const passwordTrim = passwordInput.trim()
    if (!emailTrim) {
      setSearchError('Please enter your institutional email address.')
      return
    }
    if (!EMAIL_REGEX.test(emailTrim)) {
      setSearchError('Email must end with @kgpian.iitkgp.ac.in')
      return
    }
    if (!passwordTrim) {
      setSearchError('Please enter your status checking password.')
      return
    }
    void fetchSubmission(emailTrim, passwordTrim)
  }
  const handleClearEmail = () => {
    localStorage.removeItem('revieweeEmail')
    localStorage.removeItem('revieweePassword')
    setSubmission(null)
    setFeedback(null)
    setEmailInput('')
    setPasswordInput('')
    setSearchError(null)
    setShowPDF(false)
  }

  const feedbackLabels = [
    'Structure & Format',
    'Relevance To Domain',
    'Depth Of Explanation',
    'Language & Grammar',
    'Project Improvement Ideas',
    'Additional Suggestions',
  ]

  // Render Loading State
  if (loading && !submission) {
    return (
      <section className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-4 py-10">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="text-base font-semibold text-[#4f5964]">Retrieving your submission and feedback...</p>
        </div>
      </section>
    )
  }

  // Render Search Page if no active session/submission loaded
  if (!submission) {
    return (
      <section className="animate-fade-in mx-auto flex min-h-[85vh] w-full max-w-[95%] flex-col items-center justify-center px-4 py-8 md:px-8">
        <header className="mb-8 text-center space-y-2">
          <Link href="/" className="pill-btn pill-btn-secondary inline-block mb-4">
            Back to Submission Page
          </Link>
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-accent">Review Status Portal</p>
          <h1 className="text-4xl font-black text-[#1b2126]">Check Your CV Feedback</h1>
          <p className="text-sm text-[#4f5964] max-w-md mx-auto">
            Enter your registered institutional email to check the status of your review and view feedback from seniors.
          </p>
        </header>
 
        <article className="paper-card w-full max-w-md p-6 md:p-8 animate-slide-up">
          {searchError && (
            <div className="mb-5 p-3 rounded-lg border border-[#f0c2c2] bg-[#fdf2f2] text-xs font-semibold text-[#b2352f] animate-scale-in">
              {searchError}
            </div>
          )}
 
          <form onSubmit={handleSearchSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="searchEmail" className="mb-2 block text-sm font-semibold text-[#1b2126]">
                Institutional Email Address
              </label>
              <input
                id="searchEmail"
                type="email"
                placeholder="username@kgpian.iitkgp.ac.in"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="field w-full text-sm placeholder-[#a09e90]"
                required
              />
            </div>
 
            <div>
              <label htmlFor="searchPassword" className="mb-2 block text-sm font-semibold text-[#1b2126]">
                Status Checking Password
              </label>
              <input
                id="searchPassword"
                type="password"
                placeholder="Enter your checking password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="field w-full text-sm placeholder-[#a09e90]"
                required
              />
              <p className="mt-2 text-[11px] font-semibold leading-relaxed text-[#5a5f66] bg-surface-strong p-2.5 rounded-lg border border-border">
                <strong>Forgot your password?</strong> Please check the CV submission confirmation email sent to your institutional address.
              </p>
            </div>
 
            <button type="submit" className="pill-btn pill-btn-primary w-full shadow-sm" disabled={loading}>
              {loading ? 'Searching...' : 'Search Status'}
            </button>
          </form>
 
          <footer className="mt-6 border-t border-border pt-6 text-center text-xs text-[#5a5f66]">
            Don&apos;t have a submission?{' '}
            <Link href="/" className="font-bold text-accent hover:underline">
              Submit your CV here
            </Link>
          </footer>
        </article>
      </section>
    )
  }

  // Render Dashboard
  return (
    <section className="animate-fade-in mx-auto w-full max-w-[95%] space-y-6 px-4 py-8 md:px-8">
      <header className="paper-card animate-slide-down p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="mb-1 text-sm font-semibold uppercase tracking-[0.15em] text-accent">Your Review Status</p>
          <h1 className="text-3xl font-black text-[#1b2126]">{submission.name}</h1>
          <p className="text-xs text-[#5a5f66] mt-1">Roll Number: {submission.rollNo}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleClearEmail}
            className="pill-btn pill-btn-secondary text-xs"
          >
            Check Another CV
          </button>
          <Link href="/" className="pill-btn pill-btn-primary text-xs">
            Back to Home
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Left column - CV display */}
        <section className="paper-card animate-slide-up lg:col-span-6 p-6 md:p-8 flex flex-col justify-between h-fit">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#1b2126]">Your Submitted CV</h2>
              <span className="text-xs font-bold bg-surface-strong text-[#1b2126] px-3 py-1 rounded-md">
                Track: {submission.profile}
              </span>
            </div>
            <div className="rounded-xl border border-border bg-surface overflow-hidden">
              {showPDF ? (
                <iframe
                  src={(() => {
                    const url = submission.cvLink;
                    if (!url) return '';
                    if (url.includes('drive.google.com')) {
                      let embedUrl = url;
                      if (embedUrl.includes('/view')) {
                        embedUrl = embedUrl.split('/view')[0] + '/preview';
                      } else if (embedUrl.includes('/edit')) {
                        embedUrl = embedUrl.split('/edit')[0] + '/preview';
                      }
                      return embedUrl;
                    }
                    return url;
                  })()}
                  className="h-[700px] w-full border-0"
                  title="CV PDF Viewer"
                  allow="autoplay"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 py-32">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-[#1b2126]">CV File Available</p>
                    <p className="text-xs text-[#5a5f66] mt-1">Review the document directly on our page.</p>
                  </div>
                  <button
                    onClick={() => setShowPDF(true)}
                    className="pill-btn pill-btn-primary !text-xs shadow-sm"
                  >
                    View Document Inside Website
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            {submission.cvLink && (
              <a
                href={submission.cvLink}
                target="_blank"
                rel="noopener noreferrer"
                className="pill-btn pill-btn-primary flex-1 text-center block text-xs shadow-sm"
              >
                Open CV in New Tab
              </a>
            )}
            {showPDF && (
              <button
                onClick={() => setShowPDF(false)}
                className="pill-btn pill-btn-secondary flex-1 text-xs"
              >
                Hide Document Preview
              </button>
            )}
          </div>
        </section>

        {/* Right column - Feedback / Pending Status */}
        <section className="lg:col-span-6 space-y-6">
          {feedback ? (
            <div className="paper-card animate-slide-up p-6 md:p-8 space-y-6 h-fit">
              <div className="border-b border-border pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-[#1b2126]">Detailed Feedback</h2>
                  <p className="mt-1 text-xs text-[#4f5964]">
                    Diagnostic evaluation of your CV by senior reviewers.
                  </p>
                </div>
                <span className="rounded-full px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                  Completed
                </span>
              </div>
              <div className="space-y-4">
                {feedbackLabels.map((label, index) => (
                  <article
                    key={label}
                    className="animate-scale-in rounded-xl border border-border bg-surface p-4 transition-all duration-200 hover:border-accent hover:shadow-sm"
                  >
                    <h3 className="mb-1 text-xs font-black text-accent uppercase tracking-[0.05em]">{label}</h3>
                    <p className="text-sm leading-relaxed text-[#1b2126] font-medium whitespace-pre-line">
                      {feedback.comments[index] || 'No comments provided.'}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="paper-card animate-slide-up p-8 text-center space-y-4 h-fit border border-amber-200 bg-amber-50/50">
              <div className="text-2xl">⏳</div>
              <h3 className="text-lg font-bold text-[#1b2126]">Pending Diagnostic Feedback</h3>
              <p className="text-xs text-[#5a5f66]">
                Track: <strong className="text-foreground">{submission.profile}</strong> • Status: <strong className="text-amber-700">Pending Review</strong>
              </p>
              <p className="text-sm text-[#4f5964]">
                Your CV is currently queued for evaluation by our specialized reviewers. 
                We&apos;ll send you an automated email at **{submission.email}** as soon as the review is complete!
              </p>
            </div>
          )}
        </section>
      </div>
    </section>
  )
}
