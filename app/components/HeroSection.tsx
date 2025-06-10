'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Users, BarChart3 } from 'lucide-react'

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-white to-stone-100/50 -z-10" />
      
      {/* Floating elements - much more subtle */}
      <div className="absolute inset-0 -z-10">
        <motion.div 
          className="absolute top-1/3 left-1/4 w-32 h-32 bg-stone-200/20 rounded-full blur-xl"
          animate={{ 
            y: [0, -10, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-2/3 right-1/3 w-24 h-24 bg-stone-300/20 rounded-full blur-xl"
          animate={{ 
            y: [0, 15, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto text-center">
        {/* Compact intro badge */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-100 rounded-full text-sm text-stone-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Transparent mahr data
          </div>
        </motion.div>

        {/* Main title - much cleaner */}
        <motion.h1 
          className="text-5xl md:text-6xl font-bold text-stone-900 mb-6 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          mahr.fyi
        </motion.h1>

        {/* Subtitle - more concise */}
        <motion.p 
          className="text-xl text-stone-600 mb-12 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          Anonymous, dignified data on mahr practices worldwide.
          <br />
          <span className="text-stone-800 font-medium">
            Building trust through transparency.
          </span>
        </motion.p>

        {/* CTA buttons - cleaner design */}
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.button 
            className="group inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            onClick={() => document.getElementById('submission-form')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <span>Share Your Story</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </motion.button>
          
          <motion.button 
            className="inline-flex items-center gap-2 px-6 py-3 text-stone-700 bg-stone-100 rounded-full font-medium hover:bg-stone-200 transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            onClick={() => document.getElementById('insights-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <BarChart3 className="w-4 h-4" />
            <span>View Insights</span>
          </motion.button>
        </motion.div>

        {/* Trust indicators - much more subtle */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-stone-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-stone-900">Anonymous</div>
              <div className="text-xs text-stone-600">Complete privacy</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-stone-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-stone-900">Community</div>
              <div className="text-xs text-stone-600">2,847 submissions</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-stone-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-stone-900">Transparent</div>
              <div className="text-xs text-stone-600">Open data</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection 