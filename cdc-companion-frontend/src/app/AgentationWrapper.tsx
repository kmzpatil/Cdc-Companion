'use client'

import { useEffect, useState } from 'react'
import { Agentation } from 'agentation'

export default function AgentationWrapper() {
  const [isDev, setIsDev] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setIsDev(true)
    }
  }, [])

  if (!isDev) return null

  return <Agentation />
}
