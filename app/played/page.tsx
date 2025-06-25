'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PlayedRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/compare')
  }, [router])
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-lg text-stone-700">
        Redirecting to Compare Your Mahr...
      </div>
    </div>
  )
} 