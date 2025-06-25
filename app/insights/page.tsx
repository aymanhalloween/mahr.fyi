'use client'

import React from 'react'
import { motion } from 'framer-motion'
import StatsSection from '../components/StatsSection'
import { BarChart3, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
}

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <motion.nav 
        className="sticky top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-200/50"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-stone-900 hover:text-purple-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Home
          </Link>
          <span className="font-bold text-purple-700 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Insights
          </span>
        </div>
      </motion.nav>

      <motion.section 
        className="py-16 px-6"
        {...fadeInUp}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-stone-900 mb-2">Global Mahr Insights</h1>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Explore the full statistical breakdown, trends, and analytics from the mahr.fyi community. Use this dashboard to dive deep into the data and discover patterns across cultures, professions, and time.
            </p>
          </div>
          <StatsSection hideHeader={true} />
          <div className="mt-12 flex justify-center">
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg transition-all text-lg">
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  )
} 