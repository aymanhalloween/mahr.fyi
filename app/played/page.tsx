'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, Zap, TrendingUp, TrendingDown, Loader2, Brain, Sparkles, ArrowRight, Users, BarChart3 } from 'lucide-react'
import { submitMahrData } from '../../lib/supabase'

// Mock country averages data - you can replace this with real data from your API
const COUNTRY_AVERAGES: { [key: string]: number } = {
  'AE': 45000, // UAE
  'SA': 35000, // Saudi Arabia
  'US': 25000, // USA
  'CA': 22000, // Canada
  'GB': 20000, // UK
  'AU': 28000, // Australia
  'PK': 5000,  // Pakistan
  'IN': 4000,  // India
  'BD': 3000,  // Bangladesh
  'QA': 50000, // Qatar
  'KW': 40000, // Kuwait
  'BH': 35000, // Bahrain
  'OM': 30000, // Oman
  'MY': 15000, // Malaysia
  'ID': 8000,  // Indonesia
  'TR': 12000, // Turkey
  'EG': 6000,  // Egypt
  'LB': 18000, // Lebanon
  'JO': 15000, // Jordan
}

const DEFAULT_AVERAGE = 20000

export default function PlayedPage() {
  const [step, setStep] = useState<'form' | 'loading' | 'result'>('form')
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    location: '',
    // Additional fields for better lead generation
    cultural_background: '',
    marriage_year: ''
  })
  const [result, setResult] = useState<'played' | 'clutched' | null>(null)
  const [loading, setLoading] = useState(false)

  const currencies = ['USD', 'AED', 'SAR', 'PKR', 'INR', 'GBP', 'EUR', 'CAD', 'AUD']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || !formData.location) return

    setStep('loading')
    setLoading(true)

    try {
      // Submit to database for lead generation with enhanced data
      await submitMahrData({
        asset_type: 'cash',
        cash_amount: parseFloat(formData.amount),
        cash_currency: formData.currency,
        location: formData.location,
        cultural_background: formData.cultural_background || null,
        marriage_year: formData.marriage_year ? parseInt(formData.marriage_year) : null,
        negotiated: false,
        // Add a source field to track this came from the viral page
        story: `Submitted via viral "Did you get played?" page`
      })

      // Simulate AI processing with minimum 3 second delay
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Calculate if they got played
      const countryCode = extractCountryCode(formData.location)
      const countryAverage = COUNTRY_AVERAGES[countryCode || ''] || DEFAULT_AVERAGE
      const userAmount = parseFloat(formData.amount)
      
      // Convert to USD for comparison if needed
      let normalizedAmount = userAmount
      if (formData.currency !== 'USD') {
        // Simple conversion rates - you can use a real API for this
        const conversionRates: { [key: string]: number } = {
          'AED': 0.27, 'SAR': 0.27, 'PKR': 0.0036, 'INR': 0.012,
          'GBP': 1.27, 'EUR': 1.1, 'CAD': 0.74, 'AUD': 0.66
        }
        normalizedAmount = userAmount * (conversionRates[formData.currency] || 1)
      }

      const percentageOfAverage = (normalizedAmount / countryAverage) * 100
      setResult(percentageOfAverage >= 30 ? 'clutched' : 'played')
      
    } catch (error) {
      console.error('Error:', error)
      setResult('played') // Default to played if error
    } finally {
      setLoading(false)
      setStep('result')
    }
  }

  const extractCountryCode = (location: string): string | null => {
    const locationMap: { [key: string]: string } = {
      'uae': 'AE', 'united arab emirates': 'AE', 'emirates': 'AE', 'dubai': 'AE',
      'saudi arabia': 'SA', 'saudi': 'SA', 'ksa': 'SA',
      'usa': 'US', 'united states': 'US', 'america': 'US',
      'uk': 'GB', 'united kingdom': 'GB', 'britain': 'GB', 'england': 'GB',
      'pakistan': 'PK', 'india': 'IN', 'bangladesh': 'BD',
      'canada': 'CA', 'australia': 'AU', 'qatar': 'QA', 'kuwait': 'KW'
    }
    
    const normalized = location.toLowerCase().trim()
    for (const [country, code] of Object.entries(locationMap)) {
      if (normalized.includes(country)) return code
    }
    return null
  }

  const resetForm = () => {
    setStep('form')
    setFormData({ amount: '', currency: 'USD', location: '', cultural_background: '', marriage_year: '' })
    setResult(null)
  }

  const goToMainSite = () => {
    window.location.href = '/'
  }

  const goToFullSubmission = () => {
    window.location.href = '/#submission-form'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl p-8 shadow-2xl"
            >
              <motion.div 
                className="text-center mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Did You Get <span className="text-red-500">Played</span>?
                </h1>
                <p className="text-gray-600 text-lg">
                  Enter your mahr and we'll tell you if you got the short end of the stick 🎭
                </p>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Mahr Amount
                  </label>
                  <div className="flex space-x-3">
                    <div className="relative flex-1">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        placeholder="50000"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        required
                      />
                    </div>
                    <select
                      className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={formData.currency}
                      onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    >
                      {currencies.map(curr => (
                        <option key={curr} value={curr}>{curr}</option>
                      ))}
                    </select>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., UAE, Pakistan, USA"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  />
                </motion.div>

                {/* Additional fields for better data collection */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cultural Background <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Pakistani, Arab, Desi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={formData.cultural_background}
                    onChange={(e) => setFormData({...formData, cultural_background: e.target.value})}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marriage Year <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 2023"
                    min="1950"
                    max="2024"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={formData.marriage_year}
                    onChange={(e) => setFormData({...formData, marriage_year: e.target.value})}
                  />
                </motion.div>

                <motion.button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Zap className="w-5 h-5" />
                  <span>Find Out Now</span>
                </motion.button>
              </form>

              <motion.p 
                className="text-xs text-gray-500 text-center mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                Your data helps build transparency. All submissions are anonymous.
              </motion.p>
            </motion.div>
          )}

          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl p-8 shadow-2xl text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mx-auto mb-6"
              >
                <Brain className="w-16 h-16 text-purple-600 mx-auto" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Running Through AI Models...
              </h2>
              
              <div className="space-y-3 text-gray-600">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Analyzing regional data</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Comparing to country averages</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Calculating your result</span>
                </motion.div>
              </div>

              <div className="mt-6">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className={`rounded-3xl p-8 shadow-2xl text-center ${
                result === 'played' 
                  ? 'bg-gradient-to-br from-red-500 to-red-600 text-white' 
                  : 'bg-gradient-to-br from-green-500 to-green-600 text-white'
              }`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                className="mb-6"
              >
                {result === 'played' ? (
                  <TrendingDown className="w-20 h-20 mx-auto" />
                ) : (
                  <TrendingUp className="w-20 h-20 mx-auto" />
                )}
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold mb-4"
              >
                {result === 'played' ? 'You Got Played! 😬' : 'You Clutched Up! 🔥'}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl mb-8 opacity-90"
              >
                {result === 'played' 
                  ? 'Your mahr is below the average for your region. Time to negotiate better next time!'
                  : 'Your mahr is above average for your region. You played your cards right!'
                }
              </motion.p>

              {/* FUNNEL CALL-TO-ACTION */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4 mb-8"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-2 flex items-center justify-center">
                    <Users className="w-5 h-5 mr-2" />
                    Want to see more data?
                  </h3>
                  <p className="text-sm opacity-90 mb-4">
                    Join thousands who are building transparency in marriage conversations. 
                    See detailed breakdowns by region, culture, and more.
                  </p>
                  <motion.button
                    onClick={goToMainSite}
                    className="w-full bg-white text-purple-600 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span>Explore Full Data Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>

                <motion.button
                  onClick={goToFullSubmission}
                  className="w-full bg-white/20 backdrop-blur-sm text-white py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-200 flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Share Your Full Story</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>

              <motion.button
                onClick={resetForm}
                className="bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-xl font-medium hover:bg-white/20 transition-all duration-200 text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                Check Another Amount
              </motion.button>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-6 text-sm opacity-75"
              >
                <p>Share this with friends to see if they got played too!</p>
                <p className="mt-2">🔗 mahr.fyi/played</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 