'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, Zap, TrendingUp, TrendingDown, Loader2, Brain, Sparkles, ArrowRight, Users, BarChart3, MapPin, Globe } from 'lucide-react'
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

export default function ComparePage() {
  const [step, setStep] = useState<'form' | 'loading' | 'result'>('form')
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    location: '',
    cultural_background: '',
    marriage_year: ''
  })
  const [result, setResult] = useState<'below' | 'above' | 'within' | null>(null)
  const [comparisonData, setComparisonData] = useState({
    userAmount: 0,
    averageAmount: 0,
    percentage: 0,
    location: ''
  })
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
        story: `Submitted via "Compare Your Mahr" tool`
      })

      // Simulate AI processing with minimum 2 second delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Calculate comparison
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
      const lowerBound = 70 // 30% below average
      const upperBound = 130 // 30% above average

      let resultType: 'below' | 'above' | 'within'
      if (percentageOfAverage < lowerBound) {
        resultType = 'below'
      } else if (percentageOfAverage > upperBound) {
        resultType = 'above'
      } else {
        resultType = 'within'
      }

      setComparisonData({
        userAmount: normalizedAmount,
        averageAmount: countryAverage,
        percentage: percentageOfAverage,
        location: formData.location
      })
      setResult(resultType)
      
    } catch (error) {
      console.error('Error:', error)
      setResult('within') // Default to within range if error
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

  const getResultMessage = () => {
    switch (result) {
      case 'below':
        return {
          title: 'Below Average Range',
          message: `Your mahr is below the typical range for ${comparisonData.location}. This could be due to various factors including cultural practices, economic conditions, or family circumstances.`,
          icon: TrendingDown,
          color: 'from-blue-500 to-blue-600'
        }
      case 'above':
        return {
          title: 'Above Average Range',
          message: `Your mahr is above the typical range for ${comparisonData.location}. This may reflect higher economic standards, cultural expectations, or family traditions in your area.`,
          icon: TrendingUp,
          color: 'from-green-500 to-green-600'
        }
      case 'within':
        return {
          title: 'Within Typical Range',
          message: `Your mahr falls within the typical range for ${comparisonData.location}. This suggests it aligns with common practices in your community.`,
          icon: TrendingUp,
          color: 'from-purple-500 to-purple-600'
        }
      default:
        return {
          title: 'Analysis Complete',
          message: 'Your mahr has been compared to local averages.',
          icon: TrendingUp,
          color: 'from-gray-500 to-gray-600'
        }
    }
  }

  const resultInfo = getResultMessage()

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
              className="bg-white rounded-3xl p-8 shadow-xl border border-stone-200"
            >
              <motion.div 
                className="text-center mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-stone-900 mb-3">
                  Compare Your Mahr
                </h1>
                <p className="text-stone-600 text-lg">
                  See how your mahr compares to others in your area
                </p>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    💰 Mahr Amount
                  </label>
                  <div className="flex space-x-3">
                    <div className="relative flex-1">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                      <input
                        type="number"
                        placeholder="50000"
                        className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        required
                      />
                    </div>
                    <select
                      className="px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    📍 Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., UAE, Pakistan, USA"
                    className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    🌐 Cultural Background <span className="text-stone-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Pakistani, Arab, Desi"
                    className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={formData.cultural_background}
                    onChange={(e) => setFormData({...formData, cultural_background: e.target.value})}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    📅 Marriage Year <span className="text-stone-400">(optional)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 2023"
                    min="1950"
                    max="2024"
                    className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  <BarChart3 className="w-5 h-5" />
                  <span>Check Now</span>
                </motion.button>
              </form>

              <motion.p 
                className="text-xs text-stone-500 text-center mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                All data is anonymous and helps improve transparency across communities.
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
              className="bg-white rounded-3xl p-8 shadow-xl border border-stone-200 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mx-auto mb-6"
              >
                <Brain className="w-16 h-16 text-purple-600 mx-auto" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-stone-900 mb-4">
                Analyzing Your Data...
              </h2>
              
              <div className="space-y-3 text-stone-600">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Gathering regional data</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Comparing to local averages</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generating your comparison</span>
                </motion.div>
              </div>

              <div className="mt-6">
                <div className="w-full bg-stone-200 rounded-full h-2">
                  <motion.div 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, ease: "easeInOut" }}
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
              className={`rounded-3xl p-8 shadow-xl text-center border ${
                result === 'below' 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-400' 
                  : result === 'above'
                  ? 'bg-gradient-to-br from-green-500 to-green-600 text-white border-green-400'
                  : 'bg-gradient-to-br from-purple-500 to-purple-600 text-white border-purple-400'
              }`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                className="mb-6"
              >
                <resultInfo.icon className="w-20 h-20 mx-auto" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold mb-4"
              >
                {resultInfo.title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg mb-6 opacity-90"
              >
                {resultInfo.message}
              </motion.p>

              {/* Comparison details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6"
              >
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="opacity-75">Your Mahr</div>
                    <div className="font-semibold">USD {Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(comparisonData.userAmount)}</div>
                  </div>
                  <div>
                    <div className="opacity-75">Local Average</div>
                    <div className="font-semibold">USD {Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(comparisonData.averageAmount)}</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/20">
                  <div className="opacity-75 text-sm">Global Median</div>
                  <div className="font-semibold text-lg">USD {Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(DEFAULT_AVERAGE)}</div>
                </div>
                <div className="mt-3">
                  <div className="opacity-75 text-sm">Percentage of Average</div>
                  <div className="font-semibold text-lg">{comparisonData.percentage.toFixed(0)}%</div>
                </div>
              </motion.div>

              {/* Call to action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-4 mb-6"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-2 flex items-center justify-center">
                    <Users className="w-5 h-5 mr-2" />
                    Want to see more data?
                  </h3>
                  <p className="text-sm opacity-90 mb-4">
                    Explore detailed breakdowns by region, culture, and more from our community of contributors.
                  </p>
                  <motion.button
                    onClick={goToMainSite}
                    className="w-full bg-white text-stone-900 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span>Explore Full Dashboard</span>
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
                transition={{ delay: 0.7 }}
              >
                Compare Another Amount
              </motion.button>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 text-sm opacity-75"
              >
                <p>Share this tool with friends to help build transparency!</p>
                <p className="mt-2">🔗 mahr.fyi/compare</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 