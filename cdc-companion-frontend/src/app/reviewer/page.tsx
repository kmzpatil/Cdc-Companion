'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { BACKEND_URL } from '@/constants/apiConstants'

interface Reviewee {
  id: number
  name: string
  rollNo: string
  cvLink: string
  profile: string
}

interface ReviewerInfo {
  id: number
  name: string
  profiles: string[]
  reviewedCount: number
  reviewsNumber: number
}

interface AssignedReview extends Reviewee {
  status: boolean
  assignedAt: string
  submittedAt?: string
  review?: {
    comments: string[]
  }
}

const FEEDBACK_FIELDS = [
  'Structure & Format',
  'Relevance To Domain',
  'Depth Of Explanation',
  'Language & Grammar',
  'Project Improvement Ideas',
  'Additional Suggestions',
]

export default function ReviewerDashboardPage() {
  const router = useRouter()
  const { logout } = useAuth()

  const [loadingNext, setLoadingNext] = useState(false)
  const [loadingAssigned, setLoadingAssigned] = useState(false)
  const [reviewerInfo, setReviewerInfo] = useState<ReviewerInfo | null>(null)
  const [assigned, setAssigned] = useState<AssignedReview[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedAssigned, setSelectedAssigned] = useState<AssignedReview | null>(null)
  const [ratings, setRatings] = useState<string[]>(['', '', '', '', '', ''])
  const [submittedAssigned, setSubmittedAssigned] = useState(false)
  const [showPDF, setShowPDF] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      router.push('/login/reviewer')
      return
    }

    void loadAssigned()
  }, [router])

  const loadAssigned = async () => {
    setError(null)
    setLoadingAssigned(true)

    try {
      const res = await fetch(`${BACKEND_URL}/api/reviewer/assigned`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })

      if (!res.ok) throw new Error('Failed to fetch assigned CVs')

      const data: { reviewer: ReviewerInfo; assigned: AssignedReview[] } = await res.json()
      setReviewerInfo(data.reviewer)
      setAssigned(data.assigned)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assigned CVs')
    } finally {
      setLoadingAssigned(false)
    }
  }

  const loadNext = async () => {
    setError(null)
    setLoadingNext(true)

    try {
      const nextRes = await fetch(`${BACKEND_URL}/api/reviewer/next`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })

      if (!nextRes.ok && nextRes.status !== 204) {
        throw new Error('Failed to fetch next CV')
      }

      await loadAssigned()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch next CV')
    } finally {
      setLoadingNext(false)
    }
  }

  const handleOpenReview = (rev: AssignedReview) => {
    setSelectedAssigned(rev)
    if (rev.status && rev.review?.comments && Array.isArray(rev.review.comments)) {
      const existingComments = FEEDBACK_FIELDS.map((_, idx) => rev.review?.comments[idx] || '')
      setRatings(existingComments)
    } else {
      setRatings(['', '', '', '', '', ''])
    }
    setSubmittedAssigned(false)
    setError(null)
  }

  const handleRatingChange = (idx: number, value: string) => {
    setRatings((prev) => {
      const next = [...prev]
      next[idx] = value
      return next
    })
  }

  const handleAssignedSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedAssigned) return

    if (ratings.some((rating) => !rating.trim())) {
      setError('Please fill all review fields before submitting.')
      return
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/reviewer/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          revieweeId: selectedAssigned.id,
          comments: ratings,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Review submission failed')
      }

      setSubmittedAssigned(true)
      await loadAssigned()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Review submission failed')
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login/reviewer')
  }

  if (loadingAssigned && !reviewerInfo) {
    return (
      <section className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-4 py-10">
        <p className="text-base font-semibold text-[#4f5964]">Loading reviewer dashboard...</p>
      </section>
    )
  }

  return (
    <section className="animate-fade-in mx-auto w-full max-w-7xl space-y-6 px-4 py-8 md:px-8">
      <header className="paper-card animate-slide-down flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-accent">Reviewer Dashboard</p>
          <h1 className="text-3xl font-black text-[#1b2126]">Welcome, {reviewerInfo?.name || 'Reviewer'}</h1>
        </div>
        <button onClick={handleLogout} className="pill-btn pill-btn-secondary">
          Logout
        </button>
      </header>

      {reviewerInfo && (
        <section className="paper-card animate-slide-down p-6 md:p-8">
          <h2 className="mb-4 text-xl font-bold text-[#1b2126]">Progress Snapshot</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
             {[
               { label: 'Profiles', value: reviewerInfo.profiles.join(', '), isText: true },
               { label: 'Completed', value: reviewerInfo.reviewedCount, isText: false },
               { label: 'Remaining', value: Math.max(reviewerInfo.reviewsNumber - reviewerInfo.reviewedCount, 0), isText: false },
               { label: 'Assigned', value: reviewerInfo.reviewsNumber, isText: false },
             ].map((item, idx) => (
               <article
                 key={item.label}
                 className="animate-scale-in rounded-xl border border-border bg-surface p-4"
                 style={{ animationDelay: `${idx * 100}ms` }}
               >
                 <p className="text-xs uppercase tracking-[0.08em] text-[#5a5f66]">{item.label}</p>
                 <p className={`mt-1 ${item.isText ? 'text-sm font-semibold' : 'text-2xl font-bold'} text-[#1b2126]`}>
                   {item.value}
                 </p>
               </article>
             ))}
          </div>
        </section>
      )}

      <section className="paper-card animate-slide-up p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1b2126]">Assigned CVs ({assigned.length})</h2>
            <p className="mt-1 text-sm text-[#4f5964]">Select any candidate to open the review form.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => void loadAssigned()} className="pill-btn pill-btn-secondary" disabled={loadingAssigned}>
              {loadingAssigned ? 'Refreshing...' : 'Refresh List'}
            </button>
            <button
              onClick={() => void loadNext()}
              className="pill-btn pill-btn-primary"
              disabled={loadingNext || !reviewerInfo || reviewerInfo.reviewedCount >= reviewerInfo.reviewsNumber}
            >
              {loadingNext ? 'Loading...' : 'Load Next CV'}
            </button>
          </div>
        </div>

        {assigned.length === 0 ? (
          <p className="mt-6 rounded-xl border border-border bg-surface p-4 text-sm text-[#4f5964]">
            No assigned CVs yet.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {assigned.map((review) => {
              const isSelected = selectedAssigned?.id === review.id;
              return (
                <article
                  key={review.id}
                  className="animate-slide-up rounded-xl border border-border bg-surface p-4 transition-colors duration-150 hover:border-accent"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[#1b2126]">{review.name}</h3>
                      <p className="text-sm text-[#4f5964]">Roll: {review.rollNo}</p>
                      <p className="text-sm text-[#4f5964]">Profile: {review.profile}</p>
                      <p className="mt-1 text-xs text-[#5a5f66]">Assigned: {new Date(review.assignedAt).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          review.status ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}
                      >
                        {review.status ? 'Reviewed' : 'Pending'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedAssigned(null);
                          } else {
                            handleOpenReview(review);
                          }
                        }}
                        className="pill-btn pill-btn-primary !min-h-[2.35rem] !px-4 !py-2 !text-sm"
                      >
                        {isSelected ? 'Close Review' : 'Review Candidate'}
                      </button>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-6 border-t border-border pt-6 animate-scale-in">
                      <div className="grid gap-6 md:grid-cols-3">
                        <div className="md:col-span-1">
                          <h3 className="mb-3 text-sm font-bold text-[#1b2126]">CV Document</h3>
                          <div className="rounded-xl border border-border bg-surface-strong overflow-hidden">
                            {showPDF ? (
                              <iframe
                                src={(() => {
                                  const url = review.cvLink;
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
                                className="h-[400px] w-full border-0"
                                title="CV PDF Viewer"
                                allow="autoplay"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                                <p className="text-xs text-[#4f5964]">CV ready for review</p>
                                <button onClick={() => setShowPDF(true)} className="pill-btn pill-btn-primary !text-xs !min-h-[2.1rem]">
                                  View CV
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="mt-3 flex flex-col gap-2">
                            {review.cvLink && (
                              <a
                                href={review.cvLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="pill-btn pill-btn-primary w-full text-center block text-xs !min-h-[2.1rem]"
                              >
                                Open CV in New Tab
                              </a>
                            )}
                            {showPDF && (
                              <button
                                onClick={() => setShowPDF(false)}
                                className="pill-btn pill-btn-secondary w-full text-xs !min-h-[2.1rem]"
                              >
                                Hide PDF
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          {submittedAssigned ? (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-950/10 p-6 text-center">
                              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">Review submitted successfully!</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedAssigned(null);
                                  setSubmittedAssigned(false);
                                }}
                                className="pill-btn pill-btn-primary mt-4 !text-xs"
                              >
                                Close Form
                              </button>
                            </div>
                          ) : (
                            <form onSubmit={handleAssignedSubmit} className="space-y-4" noValidate>
                              <h3 className="text-sm font-bold text-[#1b2126]">
                                {review.status ? 'Update Existing Feedback' : 'Detailed Feedback'}
                              </h3>
                              {review.status && (
                                <div className="rounded-lg bg-surface-strong border border-border p-2.5 text-xs text-foreground font-semibold">
                                  This candidate has already been reviewed. You can modify the text below to update their review.
                                </div>
                              )}
                              <div className="grid gap-4 md:grid-cols-2">
                                {FEEDBACK_FIELDS.map((label, index) => (
                                  <div
                                    key={label}
                                    className="flex flex-col"
                                  >
                                    <label htmlFor={`feedback-${index}`} className="mb-1.5 block text-xs font-semibold text-[#1b2126]">
                                      {label}
                                    </label>
                                    <textarea
                                      id={`feedback-${index}`}
                                      name={`feedback-${index}`}
                                      rows={3}
                                      value={ratings[index]}
                                      onChange={(e) => handleRatingChange(index, e.target.value)}
                                      placeholder={`Write feedback for ${label.toLowerCase()}`}
                                      className="field min-h-20 flex-1 resize-none !py-2 !px-3 !text-sm"
                                      required
                                    />
                                  </div>
                                ))}
                              </div>

                              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                                <button type="submit" className="pill-btn pill-btn-primary !min-h-[2.2rem] !text-xs">
                                  {review.status ? 'Update Review' : 'Submit Review'}
                                </button>
                                <button type="button" onClick={() => setSelectedAssigned(null)} className="pill-btn pill-btn-secondary !min-h-[2.2rem] !text-xs">
                                  Cancel
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <p aria-live="polite" className={error ? 'status-note text-sm' : 'sr-only'}>
        {error || 'No errors'}
      </p>
    </section>
  )
}
