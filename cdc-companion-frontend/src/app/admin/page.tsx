'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { BACKEND_URL } from '@/constants/apiConstants'

interface Reviewee {
  id: number
  name: string
  rollNo: string
  email: string | null
  password?: string
  cvLink: string | null
  profile: string
  status: boolean
  submissionTime: string
  assignedToId: number | null
  assignedTo?: {
    id: number
    name: string
  } | null
}

interface Reviewer {
  id: number
  name: string
  password: string
  profiles: string[]
  reviewsNumber: number
  reviewedCount: number
  email: string | null
  admin: boolean
  assignedCVs: Reviewee[]
}

interface Review {
  id: number
  comments: string[]
  submissionTime: string
  reviewee: Reviewee
  reviewer: Reviewer
}

type SortDirection = 'asc' | 'desc' | null

interface SortState {
  column: string | null
  direction: SortDirection
}

function nextSortDirection(state: SortState, column: string): SortDirection {
  if (state.column !== column) return 'asc'
  if (state.direction === 'asc') return 'desc'
  if (state.direction === 'desc') return null
  return 'asc'
}

function sortIcon(state: SortState, column: string): string {
  if (state.column !== column) return 'Sort'
  if (state.direction === 'asc') return 'Ascending'
  if (state.direction === 'desc') return 'Descending'
  return 'Sort'
}

function RevieweesTable({
  reviewees,
  reviewers,
  onReassign,
  onDelete,
}: {
  reviewees: Reviewee[]
  reviewers: Reviewer[]
  onReassign: (revieweeId: number, reviewerId: number | null) => void
  onDelete: (id: number) => void
}) {
  const [sortState, setSortState] = useState<SortState>({ column: null, direction: null })

  const sortedReviewees = useMemo(() => {
    if (!sortState.column || !sortState.direction) return reviewees

    const key = sortState.column as keyof Reviewee
    return [...reviewees].sort((a, b) => {
      const aValue = a[key] ?? ''
      const bValue = b[key] ?? ''

      const left = typeof aValue === 'string' ? aValue.toLowerCase() : aValue
      const right = typeof bValue === 'string' ? bValue.toLowerCase() : bValue

      if (left < right) return sortState.direction === 'asc' ? -1 : 1
      if (left > right) return sortState.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [reviewees, sortState])

  const columns = [
    { key: 'id', title: 'ID' },
    { key: 'name', title: 'Name' },
    { key: 'rollNo', title: 'Roll/Email' },
    { key: 'password', title: 'Password' },
    { key: 'profile', title: 'Profile' },
    { key: 'cvLink', title: 'CV Link' },
    { key: 'assignedToId', title: 'Assigned To' },
    { key: 'status', title: 'Status' },
  ]

  return (
    <section className="paper-card p-6 md:p-8">
      <h2 className="mb-4 text-xl font-bold text-[#1b2126]">Reviewees</h2>
      <div className="table-shell">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>
                  <button
                    type="button"
                    className="sort-btn"
                    onClick={() =>
                      setSortState({
                        column: column.key,
                        direction: nextSortDirection(sortState, column.key),
                      })
                    }
                    aria-label={`${column.title} ${sortIcon(sortState, column.key)}`}
                  >
                    {column.title}
                  </button>
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedReviewees.map((reviewee) => (
              <tr key={reviewee.id}>
                <td>{reviewee.id}</td>
                <td>{reviewee.name}</td>
                <td>{reviewee.rollNo}</td>
                <td className="font-mono text-xs">{reviewee.password || '-'}</td>
                <td>{reviewee.profile}</td>
                <td>
                  {reviewee.cvLink ? (
                    <a
                      href={reviewee.cvLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#7c3aed] hover:underline"
                    >
                      Open CV
                    </a>
                  ) : (
                    <span className="text-xs text-gray-500">No CV</span>
                  )}
                </td>
                 <td>
                  <select
                    value={reviewee.assignedToId ?? ''}
                    onChange={(e) => {
                      const val = e.target.value
                      onReassign(reviewee.id, val ? parseInt(val, 10) : null)
                    }}
                    className="field !min-h-[2.1rem] !py-1 !px-2 !text-xs w-full bg-white text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
                  >
                    <option value="">Unassigned</option>
                    {reviewers.map((reviewer) => (
                      <option key={reviewer.id} value={reviewer.id}>
                        {reviewer.name} ({reviewer.assignedCVs.length}/{reviewer.reviewsNumber})
                      </option>
                    ))}
                  </select>
                </td>
                <td>{reviewee.status ? 'Reviewed' : 'Pending'}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => onDelete(reviewee.id)}
                    className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline transition-colors"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function ReviewersTable({
  reviewers,
  onReassign,
  onDelete,
}: {
  reviewers: Reviewer[]
  onReassign: (revieweeId: number, reviewerId: number | null) => void
  onDelete: (id: number) => void
}) {
  const [sortState, setSortState] = useState<SortState>({ column: null, direction: null })

  const sortedReviewers = useMemo(() => {
    if (!sortState.column || !sortState.direction) return reviewers

    return [...reviewers].sort((a, b) => {
      let left: string | number = ''
      let right: string | number = ''

      switch (sortState.column) {
        case 'profiles':
          left = a.profiles.join(', ').toLowerCase()
          right = b.profiles.join(', ').toLowerCase()
          break
        case 'assignedCVs':
          left = a.assignedCVs.length
          right = b.assignedCVs.length
          break
        default: {
          const key = sortState.column as keyof Reviewer
          const aValue = a[key] ?? ''
          const bValue = b[key] ?? ''
          left = typeof aValue === 'string' ? aValue.toLowerCase() : (aValue as number)
          right = typeof bValue === 'string' ? bValue.toLowerCase() : (bValue as number)
        }
      }

      if (left < right) return sortState.direction === 'asc' ? -1 : 1
      if (left > right) return sortState.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [reviewers, sortState])

  const columns = [
    { key: 'id', title: 'ID' },
    { key: 'name', title: 'Name' },
    { key: 'password', title: 'Password' },
    { key: 'profiles', title: 'Profiles' },
    { key: 'reviewedCount', title: 'Reviewed / Quota' },
    { key: 'assignedCVs', title: 'Assigned CVs' },
  ]

  return (
    <section className="paper-card p-6 md:p-8">
      <h2 className="mb-4 text-xl font-bold text-[#1b2126]">Reviewers</h2>
      <div className="table-shell">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>
                  <button
                    type="button"
                    className="sort-btn"
                    onClick={() =>
                      setSortState({
                        column: column.key,
                        direction: nextSortDirection(sortState, column.key),
                      })
                    }
                    aria-label={`${column.title} ${sortIcon(sortState, column.key)}`}
                  >
                    {column.title}
                  </button>
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedReviewers.map((reviewer) => (
              <tr key={reviewer.id}>
                <td>{reviewer.id}</td>
                <td>{reviewer.name}</td>
                <td>{reviewer.password}</td>
                <td>{reviewer.profiles.join(', ')}</td>
                <td>
                  {reviewer.assignedCVs.length} / {reviewer.reviewsNumber}
                </td>
                 <td>
                  {reviewer.assignedCVs && reviewer.assignedCVs.length > 0 ? (
                    <div className="flex flex-col gap-1.5">
                      {reviewer.assignedCVs.map((cv) => (
                        <div
                          key={cv.id}
                          className="flex items-center justify-between gap-2 rounded bg-surface-strong px-2 py-1 text-xs border border-border"
                        >
                          <span className="font-semibold text-foreground">{cv.name} ({cv.profile})</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Unassign ${cv.name} from ${reviewer.name}?`)) {
                                onReassign(cv.id, null)
                              }
                            }}
                            className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:underline"
                          >
                            Unassign
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted">None</span>
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => onDelete(reviewer.id)}
                    className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline transition-colors"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function ReviewsTable({ reviews, onDelete }: { reviews: Review[] ; onDelete: (id: number) => void }) {
  const [sortState, setSortState] = useState<SortState>({ column: null, direction: null })

  const sortedReviews = useMemo(() => {
    if (!sortState.column || !sortState.direction) return reviews

    return [...reviews].sort((a, b) => {
      let left: string | number = ''
      let right: string | number = ''

      if (sortState.column === 'reviewee') {
        left = a.reviewee.name.toLowerCase()
        right = b.reviewee.name.toLowerCase()
      } else if (sortState.column === 'reviewer') {
        left = a.reviewer.name.toLowerCase()
        right = b.reviewer.name.toLowerCase()
      } else {
        const key = sortState.column as keyof Review
        const aValue = a[key] ?? ''
        const bValue = b[key] ?? ''
        left = typeof aValue === 'string' ? aValue.toLowerCase() : (aValue as number)
        right = typeof bValue === 'string' ? bValue.toLowerCase() : (bValue as number)
      }

      if (left < right) return sortState.direction === 'asc' ? -1 : 1
      if (left > right) return sortState.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [reviews, sortState])

  const columns = [
    { key: 'id', title: 'ID' },
    { key: 'reviewee', title: 'Reviewee' },
    { key: 'reviewer', title: 'Reviewer' },
  ]

  return (
    <section className="paper-card p-6 md:p-8">
      <h2 className="mb-4 text-xl font-bold text-[#1b2126]">Reviews</h2>
      <div className="table-shell">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>
                  <button
                    type="button"
                    className="sort-btn"
                    onClick={() =>
                      setSortState({
                        column: column.key,
                        direction: nextSortDirection(sortState, column.key),
                      })
                    }
                    aria-label={`${column.title} ${sortIcon(sortState, column.key)}`}
                  >
                    {column.title}
                  </button>
                </th>
              ))}
              <th>Comments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedReviews.map((review) => (
              <tr key={review.id}>
                <td>{review.id}</td>
                <td>{review.reviewee.name}</td>
                <td>{review.reviewer.name}</td>
                <td>
                  <ul className="list-disc pl-5">
                    {review.comments.map((comment, index) => (
                      <li key={`${review.id}-${index}`}>{comment}</li>
                    ))}
                  </ul>
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => onDelete(review.id)}
                    className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline transition-colors"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { authFetch, logout } = useAuth()

  const [reviewees, setReviewees] = useState<Reviewee[]>([])
  const [reviewers, setReviewers] = useState<Reviewer[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allocating, setAllocating] = useState(false)

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true)

        const [revieweesRes, reviewersRes, reviewsRes] = await Promise.all([
          authFetch(`${BACKEND_URL}/api/admin/reviewees`),
          authFetch(`${BACKEND_URL}/api/admin/reviewers`),
          authFetch(`${BACKEND_URL}/api/admin/reviews`),
        ])

        if (!revieweesRes.ok || !reviewersRes.ok || !reviewsRes.ok) {
          throw new Error('Failed to fetch admin data')
        }

        setReviewees(await revieweesRes.json())
        setReviewers(await reviewersRes.json())
        setReviews(await reviewsRes.json())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch admin data')
      } finally {
        setLoading(false)
      }
    }

    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      router.push('/login/admin')
      return
    }

    void loadAll()
  }, [authFetch, router])

  const handleDeleteReviewee = async (id: number) => {
    if (!confirm('Are you sure you want to delete this candidate? This will also remove any reviews they received.')) return
    try {
      const res = await authFetch(`${BACKEND_URL}/api/admin/reviewee/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete reviewee')
      setReviewees(prev => prev.filter(r => r.id !== id))
      setReviews(prev => prev.filter(r => r.reviewee.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const handleDeleteReviewer = async (id: number) => {
    if (!confirm('Are you sure you want to delete this reviewer? All their assigned candidates will be set back to unassigned.')) return
    try {
      const res = await authFetch(`${BACKEND_URL}/api/admin/reviewer/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete reviewer')
      setReviewers(prev => prev.filter(r => r.id !== id))
      setReviewees(prev => prev.map(r => r.assignedToId === id ? { ...r, assignedToId: null } : r))
      setReviews(prev => prev.filter(r => r.reviewer.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const handleDeleteReview = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review? The candidate status will be set back to pending review.')) return
    try {
      const res = await authFetch(`${BACKEND_URL}/api/admin/review/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete review')
      setReviews(prev => prev.filter(r => r.id !== id))
      const targetReview = reviews.find(r => r.id === id)
      if (targetReview) {
        setReviewees(prev => prev.map(r => r.id === targetReview.reviewee.id ? { ...r, status: false } : r))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const handleAllocate = async () => {
    setAllocating(true)
    setError(null)

    try {
      const res = await authFetch(`${BACKEND_URL}/api/admin/allocate`, { method: 'POST' })
      if (!res.ok) throw new Error('Allocation failed')

      const updatedReviewees = await authFetch(`${BACKEND_URL}/api/admin/reviewees`)
      if (updatedReviewees.ok) setReviewees(await updatedReviewees.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Allocation failed')
    } finally {
      setAllocating(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login/admin')
  }

  const handleReassign = async (revieweeId: number, reviewerId: number | null) => {
    try {
      const res = await authFetch(`${BACKEND_URL}/api/admin/reassign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revieweeId, reviewerId }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update assignment')
      }

      const [revieweesRes, reviewersRes] = await Promise.all([
        authFetch(`${BACKEND_URL}/api/admin/reviewees`),
        authFetch(`${BACKEND_URL}/api/admin/reviewers`),
      ])

      if (revieweesRes.ok) setReviewees(await revieweesRes.json())
      if (reviewersRes.ok) setReviewers(await reviewersRes.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reassignment failed')
    }
  }

  if (loading) {
    return (
      <section className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-4 py-10">
        <p className="text-base font-semibold text-[#4f5964]">Loading admin dashboard...</p>
      </section>
    )
  }

  return (
    <section className="animate-fade-in mx-auto w-full max-w-[95%] space-y-6 px-4 py-8 md:px-8">
      <header className="paper-card animate-slide-down flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-accent">Admin Dashboard</p>
          <h1 className="text-3xl font-black text-[#1b2126]">Manage Review Pipeline</h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={handleAllocate} className="pill-btn pill-btn-primary" disabled={allocating}>
            {allocating ? 'Allocating...' : 'Run Allocation'}
          </button>
          <button type="button" onClick={handleLogout} className="pill-btn pill-btn-secondary">
            Logout
          </button>
        </div>
      </header>

      <p aria-live="polite" className={error ? 'status-note text-sm' : 'sr-only'}>
        {error || 'No errors'}
      </p>

      <div className="animate-slide-up">
        <RevieweesTable reviewees={reviewees} reviewers={reviewers} onReassign={handleReassign} onDelete={handleDeleteReviewee} />
      </div>
      <div className="animate-slide-up">
        <ReviewersTable reviewers={reviewers} onReassign={handleReassign} onDelete={handleDeleteReviewer} />
      </div>
      <div className="animate-slide-up">
        <ReviewsTable reviews={reviews} onDelete={handleDeleteReview} />
      </div>
    </section>
  )
}
