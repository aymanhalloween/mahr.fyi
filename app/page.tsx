'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  TrendingUp, 
  Users, 
  Globe, 
  Heart,
  ChevronDown,
  Send,
  BarChart3,
  BookOpen,
  Shield
} from 'lucide-react'
import HeroSection from './components/HeroSection'
import SubmissionForm from './components/SubmissionForm'
import StatsSection from './components/StatsSection'
import dynamic from 'next/dynamic'
import EducationalSection from './components/EducationalSection'

// Fast, precise animations
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
}

const MapVisualization = dynamic(() => import('./components/MapVisualization'), { 
  ssr: false,
  loading: () => <div className="text-center py-8">Loading map...</div>
})

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-stone-200/50"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="text-xl font-semibold text-stone-900"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              mahr.fyi
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Summary Stats Bar */}
      <motion.section 
        className="py-8 px-6"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-50px" }}
      >
        <div className="max-w-7xl mx-auto">
          <StatsSection summaryOnly />
        </div>
      </motion.section>

      {/* Map Visualization */}
      <motion.section 
        className="py-16 px-6"
        {...fadeInUp}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-50px" }}
      >
        <div className="max-w-7xl mx-auto">
          <MapVisualization />
        </div>
      </motion.section>

      {/* Submission Form */}
      <motion.section 
        className="py-16 px-6 bg-stone-50/50"
        {...fadeInUp}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-50px" }}
      >
        <div className="max-w-4xl mx-auto">
          <SubmissionForm />
        </div>
      </motion.section>

      {/* Educational Content */}
      <motion.section 
        className="py-16 px-6 bg-stone-50/50"
        {...fadeInUp}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-50px" }}
      >
        <div className="max-w-6xl mx-auto">
          <EducationalSection />
        </div>
      </motion.section>



      {/* Footer */}
      <motion.footer 
        className="py-12 px-6 bg-stone-900 text-white"
        {...fadeInUp}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            className="mb-6"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <h3 className="text-xl font-semibold mb-2">mahr.fyi</h3>
            <p className="text-stone-400 text-sm">
              Building transparency and dignity in marriage conversations
            </p>
          </motion.div>
          <div className="flex items-center justify-center gap-6 text-xs text-stone-500">
            <span>Privacy First</span>
            <span>•</span>
            <span>Community Driven</span>
            <span>•</span>
            <span>Data Transparency</span>
          </div>
        </div>
      </motion.footer>
    </div>
  )
} 