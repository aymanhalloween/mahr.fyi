'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, DollarSign, MapPin, User, Calendar, Shield, TrendingUp, Home, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { submitMahrData, supabase } from '../../lib/supabase'
import { COUNTRIES } from '../../lib/locationNormalizer'
import { normalizeLocation } from '../../lib/locationNormalizer'

const SubmissionForm = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [formData, setFormData] = useState({
    // Asset Information
    asset_type: '',
    cash_amount: '',
    cash_currency: 'USD',
    asset_description: '',
    estimated_value: '',
    estimated_value_currency: 'USD',
    
    // Location & Demographics
    location: '',
    cultural_background: '',
    profession: '',
    marriage_year: '',
    
    // Context
    story: '',
    family_pressure_level: '',
    negotiated: false
  })

  const [countrySuggestions, setCountrySuggestions] = useState<string[]>([])
  const [countryValid, setCountryValid] = useState<boolean | null>(null)
  const [countryTouched, setCountryTouched] = useState(false)

  const steps = [
    { title: 'Asset Type', fields: ['asset_type'] },
    { title: 'Asset Details', fields: ['amount_details'] },
    { title: 'Background', fields: ['location', 'cultural_background'] },
    { title: 'Context', fields: ['profession', 'marriage_year'] },
    { title: 'Your Story', fields: ['story', 'family_pressure_level'] }
  ]

  const assetTypes = [
    { value: 'cash', label: 'Cash', icon: DollarSign, desc: 'Money, bank transfer' },
    { value: 'gold', label: 'Gold', icon: '🏅', desc: 'Gold jewelry, coins, bars' },
    { value: 'jewelry', label: 'Jewelry', icon: '💎', desc: 'Diamond, precious stones' },
    { value: 'property', label: 'Property', icon: Home, desc: 'Real estate, land' },
    { value: 'stocks', label: 'Stocks/Investments', icon: TrendingUp, desc: 'Shares, bonds, crypto' },
    { value: 'business', label: 'Business', icon: '🏢', desc: 'Business ownership, equity' },
    { value: 'mixed', label: 'Mixed Assets', icon: '📊', desc: 'Combination of above' },
    { value: 'other', label: 'Other', icon: '📝', desc: 'Something else' }
  ] as const

  const currencies = ['USD', 'AED', 'SAR', 'PKR', 'INR', 'GBP', 'EUR', 'CAD', 'AUD']

  // Helper functions for number formatting
  const formatNumberInput = (value: string): string => {
    // Remove any non-numeric characters except commas and decimals
    const cleaned = value.replace(/[^0-9.,]/g, '')
    // Remove multiple commas/decimals
    const parts = cleaned.split('.')
    const integerPart = parts[0].replace(/,/g, '')
    const decimalPart = parts.length > 1 ? '.' + parts[1] : ''
    
    // Add commas to integer part
    const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return formatted + decimalPart
  }

  const parseNumberInput = (value: string): number => {
    // Remove commas, dollar signs, and other non-numeric characters except decimals
    const cleaned = value.replace(/[$,]/g, '').replace(/[^0-9.]/g, '')
    return parseFloat(cleaned) || 0
  }

  const handleAmountChange = (field: string, value: string) => {
    // Allow user to type $ at the beginning, then format the number
    const withoutDollar = value.replace(/^\$/, '')
    const formatted = formatNumberInput(withoutDollar)
    updateFormData(field, formatted)
  }

  // Add a mapping for common abbreviations to canonical country names
  const COUNTRY_ABBREVIATIONS: Record<string, string> = {
    'usa': 'United States',
    'us': 'United States',
    'america': 'United States',
    'u.s.': 'United States',
    'u.s.a.': 'United States',
    'uk': 'United Kingdom',
    'u.k.': 'United Kingdom',
    'england': 'United Kingdom',
    'uae': 'United Arab Emirates',
    'emirates': 'United Arab Emirates',
    'ksa': 'Saudi Arabia',
    'saudi': 'Saudi Arabia',
    // Add more as needed
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCountryInput = (value: string) => {
    updateFormData('location', value)
    setCountryTouched(true)
    if (!value) {
      setCountrySuggestions([])
      setCountryValid(null)
      return
    }
    // Check for abbreviation match
    const abbrKey = value.trim().toLowerCase()
    let canonical = COUNTRY_ABBREVIATIONS[abbrKey]
    let suggestions: string[] = []
    if (canonical) {
      suggestions = [canonical]
    } else {
      suggestions = COUNTRIES.filter(c => c.toLowerCase().includes(value.toLowerCase())).slice(0, 6)
    }
    setCountrySuggestions(suggestions)
    // Live validation: is it an exact match or abbreviation?
    setCountryValid(
      COUNTRIES.map(c => c.toLowerCase()).includes(value.toLowerCase()) ||
      !!COUNTRY_ABBREVIATIONS[abbrKey]
    )
  }

  const handleCountrySuggestionClick = (country: string) => {
    updateFormData('location', country)
    setCountrySuggestions([])
    setCountryValid(true)
    setCountryTouched(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setCountryTouched(true)
    
    // Enhanced country validation with better error handling
    let input = formData.location || ''
    const abbrKey = input.trim().toLowerCase()
    if (COUNTRY_ABBREVIATIONS[abbrKey]) {
      input = COUNTRY_ABBREVIATIONS[abbrKey]
      updateFormData('location', input)
    }
    try {
      const norm = await normalizeLocation(input)
      if (!norm.canonical) {
        setCountryValid(false)
        setIsSubmitting(false)
        setSubmitStatus('error')
        alert('Please enter a valid country from the list.')
        return
      }
      // Sanitize payload: convert empty strings to null
      const sanitize = (val: any) => (val === '' ? null : val)
      // Build submissionData based on asset type
      let submissionData: any = {
        asset_type: formData.asset_type,
        location: norm.canonical,
        cultural_background: sanitize(formData.cultural_background),
        profession: sanitize(formData.profession),
        marriage_year: formData.marriage_year ? parseInt(formData.marriage_year) : null,
        story: sanitize(formData.story),
        family_pressure_level: formData.family_pressure_level ? parseInt(formData.family_pressure_level) : null,
        negotiated: formData.negotiated
      }
      if (formData.asset_type === 'cash') {
        submissionData.cash_amount = formData.cash_amount ? parseNumberInput(formData.cash_amount) : null
        submissionData.cash_currency = sanitize(formData.cash_currency)
        submissionData.asset_description = null
        submissionData.estimated_value = null
        submissionData.estimated_value_currency = null
      } else {
        submissionData.cash_amount = null
        submissionData.cash_currency = null
        submissionData.asset_description = sanitize(formData.asset_description)
        submissionData.estimated_value = formData.estimated_value ? parseNumberInput(formData.estimated_value) : null
        submissionData.estimated_value_currency = sanitize(formData.estimated_value_currency)
      }
      // Debug: log payload
      console.log('Submitting to Supabase:', submissionData)
      const result = await submitMahrData(submissionData)
      if (result.success) {
        setSubmitStatus('success')
        // Reset form after success
        setTimeout(() => {
          setCurrentStep(0)
          setFormData({
            asset_type: '',
            cash_amount: '',
            cash_currency: 'USD',
            asset_description: '',
            estimated_value: '',
            estimated_value_currency: 'USD',
            location: '',
            cultural_background: '',
            profession: '',
            marriage_year: '',
            story: '',
            family_pressure_level: '',
            negotiated: false
          })
          setSubmitStatus('idle')
          setCountryValid(null)
          setCountryTouched(false)
          setCountrySuggestions([])
        }, 3000)
      } else {
        console.error('Submission failed:', result.error)
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Submission error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-2xl mx-auto" id="submission-form">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-stone-900 mb-3">
          Share Your Experience
        </h2>
        <p className="text-lg text-stone-600">
          Help build transparency by anonymously sharing your mahr data.
        </p>
      </motion.div>

      <motion.div 
        className="card p-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-stone-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-stone-500">
              {steps[currentStep].title}
            </span>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-1.5">
            <motion.div 
              className="bg-stone-900 h-1.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {/* Step 1: Asset Type */}
            {currentStep === 0 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-4">
                    What type of mahr did you receive?
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {assetTypes.map((type) => {
                      const IconComponent = typeof type.icon === 'string' ? 
                        () => <span className="text-xl">{type.icon}</span> : 
                        type.icon as React.ComponentType<{ className?: string }>
                      
                      return (
                        <motion.button
                          key={type.value}
                          type="button"
                          onClick={() => updateFormData('asset_type', type.value)}
                          className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                            formData.asset_type === type.value
                              ? 'border-stone-900 bg-stone-50'
                              : 'border-stone-200 hover:border-stone-300'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center space-x-3">
                            <IconComponent className="w-5 h-5 text-stone-700" />
                            <div>
                              <div className="font-medium text-stone-900">{type.label}</div>
                              <div className="text-sm text-stone-500">{type.desc}</div>
                            </div>
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Asset Details */}
            {currentStep === 1 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="space-y-6"
              >
                {formData.asset_type === 'cash' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        <DollarSign className="inline w-4 h-4 mr-1" />
                        Cash Amount
                      </label>
                      <div className="flex space-x-3">
                        <input 
                          type="text"
                          placeholder="50,000 or $50,000"
                          className="input-field flex-1"
                          value={formData.cash_amount}
                          onChange={(e) => handleAmountChange('cash_amount', e.target.value)}
                        />
                        <select 
                          className="input-field w-24"
                          value={formData.cash_currency}
                          onChange={(e) => updateFormData('cash_currency', e.target.value)}
                        >
                          {currencies.map(curr => (
                            <option key={curr} value={curr}>{curr}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Asset Description
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g., 2oz gold jewelry, 100 Apple shares, 2BR apartment"
                        className="input-field"
                        value={formData.asset_description}
                        onChange={(e) => updateFormData('asset_description', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Estimated Value (at time of marriage)
                      </label>
                      <div className="flex space-x-3">
                        <input 
                          type="text"
                          placeholder="25,000 or $25,000"
                          className="input-field flex-1"
                          value={formData.estimated_value}
                          onChange={(e) => handleAmountChange('estimated_value', e.target.value)}
                        />
                        <select 
                          className="input-field w-24"
                          value={formData.estimated_value_currency}
                          onChange={(e) => updateFormData('estimated_value_currency', e.target.value)}
                        >
                          {currencies.map(curr => (
                            <option key={curr} value={curr}>{curr}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* Step 3: Background */}
            {currentStep === 2 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    Country
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="input-field pr-10"
                      placeholder="Start typing your country..."
                      value={formData.location}
                      onChange={e => handleCountryInput(e.target.value)}
                      onBlur={() => setTimeout(() => setCountrySuggestions([]), 200)}
                      onFocus={() => formData.location && setCountrySuggestions(COUNTRIES.filter(c => c.toLowerCase().includes(formData.location.toLowerCase())).slice(0, 6))}
                      autoComplete="off"
                    />
                    {countryTouched && countryValid === true && (
                      <CheckCircle className="absolute right-2 top-2 text-green-500 w-5 h-5" />
                    )}
                    {countryTouched && countryValid === false && (
                      <XCircle className="absolute right-2 top-2 text-red-500 w-5 h-5" />
                    )}
                    {countrySuggestions.length > 0 && (
                      <div className="absolute z-10 bg-white border border-stone-200 rounded shadow w-full mt-1 max-h-40 overflow-auto">
                        {countrySuggestions.map((country, idx) => (
                          <div
                            key={country}
                            className="px-4 py-2 hover:bg-stone-100 cursor-pointer text-sm"
                            onMouseDown={() => handleCountrySuggestionClick(country)}
                          >
                            {country}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Please enter your country (no cities or regions)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Cultural Background
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g., South Asian, Arab, Mixed"
                    className="input-field"
                    value={formData.cultural_background}
                    onChange={(e) => updateFormData('cultural_background', e.target.value)}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 4: Context */}
            {currentStep === 3 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    <User className="inline w-4 h-4 mr-1" />
                    Profession (Optional)
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g., Engineer, Teacher, Student"
                    className="input-field"
                    value={formData.profession}
                    onChange={(e) => updateFormData('profession', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Year of Marriage
                  </label>
                  <input 
                    type="number"
                    placeholder="e.g., 2023"
                    min="1950"
                    max={new Date().getFullYear() + 1}
                    className="input-field"
                    value={formData.marriage_year}
                    onChange={(e) => updateFormData('marriage_year', e.target.value)}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 5: Story & Context */}
            {currentStep === 4 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Family Pressure Level (Optional)
                  </label>
                  <select 
                    className="input-field"
                    value={formData.family_pressure_level}
                    onChange={(e) => updateFormData('family_pressure_level', e.target.value)}
                  >
                    <option value="">Select level</option>
                    <option value="1">1 - No pressure</option>
                    <option value="2">2 - Minimal pressure</option>
                    <option value="3">3 - Moderate pressure</option>
                    <option value="4">4 - High pressure</option>
                    <option value="5">5 - Extreme pressure</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox"
                      checked={formData.negotiated}
                      onChange={(e) => updateFormData('negotiated', e.target.checked)}
                      className="rounded border-stone-300 text-stone-900 focus:ring-stone-500"
                    />
                    <span className="text-sm text-stone-700">The mahr amount was negotiated</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Your Story (Optional)
                  </label>
                  <textarea 
                    placeholder="Share any context, feelings, or experiences about your mahr..."
                    className="input-field h-24 resize-none"
                    value={formData.story}
                    onChange={(e) => updateFormData('story', e.target.value)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="px-6 py-2 text-stone-600 hover:text-stone-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            {currentStep === steps.length - 1 ? (
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Anonymously</span>
                  </>
                )}
              </motion.button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={!formData.asset_type && currentStep === 0}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            )}
          </div>
        </form>

        {/* Privacy Notice */}
        <div className="mt-6 p-4 bg-stone-50 rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-stone-600">
            <Shield className="w-4 h-4" />
            <span>Your privacy is protected. All data is anonymized and encrypted.</span>
          </div>
        </div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {submitStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Thank you for your contribution!</p>
                  <p className="text-sm text-green-600">Your data has been submitted anonymously and will help others in the community.</p>
                </div>
              </div>
            </motion.div>
          )}

          {submitStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">Something went wrong</p>
                  <p className="text-sm text-red-600">Please try again or check your internet connection.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default SubmissionForm 