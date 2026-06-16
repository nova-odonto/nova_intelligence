// src/app/briefing/briefing-tracker.tsx
'use client'

import { useEffect } from 'react'

export function BriefingTracker() {
  useEffect(() => {
    fetch('/api/briefing/seen', { method: 'POST' })
  }, [])

  return null
}