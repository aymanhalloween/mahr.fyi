'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, MapPin, DollarSign, RefreshCw, BarChart3 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

interface DashboardStats {
  totalSubmissions: number
  globalMedian: number
  globalAverage: number
  globalPercentiles: {
    p25: number
    p50: number
    p75: number
    p90: number
    p95: number
  }
  uniqueCountries: number
  cashPercentage: number
  regionalTrends: Array<{
    region: string
    median: number
    average: number
    count: number
    standardDeviation: number
  }>
  assetTypeBreakdown: Array<{
    asset_type: string
    count: number
    percentage: number
    medianValue: number
    averageValue: number
  }>
  yearlyTrends: Array<{
    year: number
    median: number
    average: number
    count: number
  }>
  culturalAnalysis: Array<{
    cultural_background: string
    median: number
    average: number
    count: number
  }>
  professionalAnalysis: Array<{
    profession: string
    median: number
    average: number
    count: number
  }>
}

interface StatsSectionProps {
  summaryOnly?: boolean
}

const StatsSection = ({ summaryOnly = false }: StatsSectionProps) => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      if (!supabase) {
        console.warn('Supabase client not available, skipping stats fetch')
        setStats(null)
        return
      }
      
      // Get total submissions
      const { count: totalSubmissions } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })

      // Get all submissions for calculations
      const { data: submissions } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false })

      if (!submissions) {
        setStats(null)
        return
      }

      // Calculate global median
      const values = submissions
        .map(s => s.asset_type === 'cash' ? s.cash_amount : s.estimated_value)
        .filter(v => v && v > 0)
        .sort((a, b) => a - b)
      
      const globalMedian = values.length > 0 ? 
        values.length % 2 === 0 
          ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
          : values[Math.floor(values.length / 2)]
        : 0

      // Count unique countries (by country_code or fallback to location)
      let uniqueCountries = new Set(
        submissions
          .map(s => s.country_code)
          .filter(c => c)
      ).size;
      if (uniqueCountries === 0) {
        uniqueCountries = new Set(
          submissions
            .map(s => s.location)
            .filter(l => l)
        ).size;
      }

      // Calculate cash percentage
      const cashSubmissions = submissions.filter(s => s.asset_type === 'cash').length
      const cashPercentage = totalSubmissions ? Math.round((cashSubmissions / totalSubmissions) * 100) : 0

      // Regional trends with enhanced statistics
      const regionGroups = submissions.reduce((acc, submission) => {
        const region = submission.region || 'Unknown'
        if (!acc[region]) acc[region] = []
        
        const value = submission.asset_type === 'cash' ? 
          submission.cash_amount : submission.estimated_value
        if (value && value > 0) acc[region].push(value)
        
        return acc
      }, {} as Record<string, number[]>)

      const regionalTrends = (Object.entries(regionGroups) as [string, number[]][])
        .filter(([region, values]) => region !== 'Unknown' && values.length > 0)
        .map(([region, values]) => {
          const sortedValues = [...values].sort((a, b) => a - b)
          const median = sortedValues.length % 2 === 0 
            ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
            : sortedValues[Math.floor(sortedValues.length / 2)]
          const average = values.reduce((a, b) => a + b, 0) / values.length
          const variance = values.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / values.length
          const standardDeviation = Math.sqrt(variance)
          
          return {
            region,
            median: Math.round(median),
            average: Math.round(average),
            count: values.length,
            standardDeviation: Math.round(standardDeviation)
          }
        })
        .sort((a, b) => b.median - a.median)
        .slice(0, 4)

      // Asset type breakdown with enhanced statistics
      const assetTypeGroups = submissions.reduce((acc, submission) => {
        const type = submission.asset_type
        if (!acc[type]) acc[type] = { count: 0, values: [] }
        acc[type].count += 1
        
        const value = submission.asset_type === 'cash' ? 
          submission.cash_amount : submission.estimated_value
        if (value && value > 0) acc[type].values.push(value)
        
        return acc
      }, {} as Record<string, { count: number, values: number[] }>)

      const assetTypeBreakdown = (Object.entries(assetTypeGroups) as [string, { count: number, values: number[] }][])
        .map(([asset_type, data]) => {
          const sortedValues = [...data.values].sort((a: number, b: number) => a - b)
          const medianValue = sortedValues.length > 0 ? 
            (sortedValues.length % 2 === 0 
              ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
              : sortedValues[Math.floor(sortedValues.length / 2)]) : 0
          const averageValue = data.values.length > 0 ? 
            data.values.reduce((a: number, b: number) => a + b, 0) / data.values.length : 0
          
          return {
            asset_type,
            count: data.count,
            percentage: totalSubmissions ? Math.round((data.count / totalSubmissions) * 100) : 0,
            medianValue: Math.round(medianValue),
            averageValue: Math.round(averageValue)
          }
        })
        .sort((a, b) => b.count - a.count)

      // Yearly trends analysis
      const yearlyGroups = submissions.reduce((acc, submission) => {
        const year = submission.marriage_year
        if (!year || year < 2010) return acc // Only include recent years
        
        if (!acc[year]) acc[year] = []
        const value = submission.asset_type === 'cash' ? 
          submission.cash_amount : submission.estimated_value
        if (value && value > 0) acc[year].push(value)
        
        return acc
      }, {} as Record<number, number[]>)

      const yearlyTrends = (Object.entries(yearlyGroups) as [string, number[]][])
        .map(([year, values]) => {
          const sortedValues = [...values].sort((a, b) => a - b)
          const median = sortedValues.length % 2 === 0 
            ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
            : sortedValues[Math.floor(sortedValues.length / 2)]
          const average = values.reduce((a, b) => a + b, 0) / values.length
          
          return {
            year: parseInt(year),
            median: Math.round(median),
            average: Math.round(average),
            count: values.length
          }
        })
        .sort((a, b) => b.year - a.year)
        .slice(0, 10) // Last 10 years

      // Cultural background analysis
      const culturalGroups = submissions.reduce((acc, submission) => {
        const background = submission.cultural_background?.trim()
        if (!background) return acc
        
        if (!acc[background]) acc[background] = []
        const value = submission.asset_type === 'cash' ? 
          submission.cash_amount : submission.estimated_value
        if (value && value > 0) acc[background].push(value)
        
        return acc
      }, {} as Record<string, number[]>)

      const culturalAnalysis = (Object.entries(culturalGroups) as [string, number[]][])
        .filter(([_, values]) => values.length >= 3) // Only include groups with 3+ submissions
        .map(([cultural_background, values]) => {
          const sortedValues = [...values].sort((a: number, b: number) => a - b)
          const median = sortedValues.length % 2 === 0 
            ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
            : sortedValues[Math.floor(sortedValues.length / 2)]
          const average = values.reduce((a: number, b: number) => a + b, 0) / values.length
          
          return {
            cultural_background,
            median: Math.round(median),
            average: Math.round(average),
            count: values.length
          }
        })
        .sort((a, b) => b.median - a.median)
        .slice(0, 6)

      // Professional analysis
      const professionalGroups = submissions.reduce((acc, submission) => {
        const profession = submission.profession?.trim()
        if (!profession) return acc
        
        if (!acc[profession]) acc[profession] = []
        const value = submission.asset_type === 'cash' ? 
          submission.cash_amount : submission.estimated_value
        if (value && value > 0) acc[profession].push(value)
        
        return acc
      }, {} as Record<string, number[]>)

      const professionalAnalysis = (Object.entries(professionalGroups) as [string, number[]][])
        .filter(([_, values]) => values.length >= 3) // Only include groups with 3+ submissions
        .map(([profession, values]) => {
          const sortedValues = [...values].sort((a: number, b: number) => a - b)
          const median = sortedValues.length % 2 === 0 
            ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
            : sortedValues[Math.floor(sortedValues.length / 2)]
          const average = values.reduce((a: number, b: number) => a + b, 0) / values.length
          
          return {
            profession,
            median: Math.round(median),
            average: Math.round(average),
            count: values.length
          }
        })
        .sort((a, b) => b.median - a.median)
        .slice(0, 6)

      setStats({
        totalSubmissions: totalSubmissions || 0,
        globalMedian,
        globalAverage: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0,
        globalPercentiles: {
          p25: values.length > 0 ? values[Math.floor(values.length * 0.25)] : 0,
          p50: values.length > 0 ? values[Math.floor(values.length * 0.5)] : 0,
          p75: values.length > 0 ? values[Math.floor(values.length * 0.75)] : 0,
          p90: values.length > 0 ? values[Math.floor(values.length * 0.9)] : 0,
          p95: values.length > 0 ? values[Math.floor(values.length * 0.95)] : 0
        },
        uniqueCountries,
        cashPercentage,
        regionalTrends,
        assetTypeBreakdown,
        yearlyTrends,
        culturalAnalysis,
        professionalAnalysis
      })
      
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`
    return `$${amount.toLocaleString()}`
  }

  const mainStats = stats ? [
    {
      icon: Users,
      value: stats.totalSubmissions.toLocaleString(),
      label: 'Submissions',
      change: 'Anonymous contributions'
    },
    {
      icon: DollarSign,
      value: formatCurrency(stats.globalAverage),
      label: 'Global Average',
      change: `Median: ${formatCurrency(stats.globalMedian)}`
    },
    {
      icon: MapPin,
      value: stats.uniqueCountries.toString(),
      label: 'Countries',
      change: 'Growing worldwide'
    },
    {
      icon: TrendingUp,
      value: `${stats.cashPercentage}%`,
      label: 'Cash-based',
      change: 'Most common type'
    }
  ] : []

  if (loading) {
    return (
      <div className="space-y-12" id="insights-section">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-stone-900 mb-3">Global Insights</h2>
          <p className="text-lg text-stone-600">Loading real-time data...</p>
        </div>
        <div className="flex justify-center">
          <RefreshCw className="w-8 h-8 text-stone-400 animate-spin" />
        </div>
      </div>
    )
  }

  if (!stats || stats.totalSubmissions === 0) {
    return (
      <div className="space-y-12" id="insights-section">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-stone-900 mb-3">Global Insights</h2>
          <p className="text-lg text-stone-600">Be the first to contribute data to this community resource.</p>
        </div>
        <div className="card p-8 text-center">
          <p className="text-stone-600 mb-4">No submissions yet. Help build transparency by sharing your experience.</p>
        </div>
      </div>
    )
  }

  // Summary stats bar for landing page
  if (summaryOnly) {
    // Filter out the Countries stat for the hero page
    const heroStats = mainStats.filter(stat => stat.label !== 'Countries')
    
    return (
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {heroStats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center text-center flex-1">
              <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center mb-1">
                <stat.icon className="w-4 h-4 text-stone-600" />
              </div>
              <div className="text-xl font-bold text-stone-900">{stat.value}</div>
              <div className="text-sm font-medium text-stone-700">{stat.label}</div>
              <div className="text-xs text-stone-500">{stat.change}</div>
            </div>
          ))}
          <div className="flex flex-col items-center text-center flex-1">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-1">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <Link href="/insights" className="inline-block px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow transition-all text-sm mt-1">See All Insights</Link>
            <div className="text-xs text-stone-500 mt-1">Last updated: {lastUpdated ? lastUpdated.toLocaleDateString() + ' ' + lastUpdated.toLocaleTimeString() : '—'}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12" id="insights-section">
      {/* Header */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-bold text-stone-900 mb-3">
          Global Insights
        </h2>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto">
          Real data from real people, building transparency worldwide.
        </p>
        {lastUpdated && (
          <p className="text-sm text-stone-500 mt-2">
            Last updated: {lastUpdated.toLocaleDateString()} at {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </motion.div>

      {/* Main Stats Grid */}
      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        viewport={{ once: true }}
      >
        {mainStats.map((stat, index) => (
          <motion.div
            key={index}
            className="card p-6 text-center group"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
            viewport={{ once: true }}
            whileHover={{ y: -2 }}
          >
            <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-stone-200 transition-colors duration-150">
              <stat.icon className="w-5 h-5 text-stone-600" />
            </div>
            <div className="text-2xl font-bold text-stone-900 mb-1">
              {stat.value}
            </div>
            <div className="text-sm font-medium text-stone-700 mb-1">
              {stat.label}
            </div>
            <div className="text-xs text-stone-500">
              {stat.change}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Regional Trends */}
      {stats.regionalTrends.length > 0 && (
        <motion.div
          className="card p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-stone-900 mb-1">
                Regional Trends
              </h3>
              <p className="text-sm text-stone-600">
                Median vs average mahr amounts by region
              </p>
            </div>
            <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-stone-600" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.regionalTrends.map((trend, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-4 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors duration-150"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                viewport={{ once: true }}
              >
                <div>
                  <div className="font-semibold text-stone-900 text-sm">
                    {trend.region}
                  </div>
                  <div className="text-xs text-stone-600 space-y-1">
                    <div>Median: {formatCurrency(trend.median)}</div>
                    <div>Average: {formatCurrency(trend.average)}</div>
                    <div className="text-stone-500">σ: {formatCurrency(trend.standardDeviation)}</div>
                  </div>
                </div>
                <div className="text-xs text-stone-500 text-right">
                  <div>{trend.count} submissions</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Global Percentiles */}
      {stats.globalPercentiles && (
        <motion.div
          className="card p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-stone-900 mb-1">
                Global Distribution
              </h3>
              <p className="text-sm text-stone-600">
                Percentile breakdown of mahr amounts worldwide
              </p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {[
              { label: '25th', value: stats.globalPercentiles.p25, desc: 'Bottom quarter' },
              { label: '50th', value: stats.globalPercentiles.p50, desc: 'Median' },
              { label: '75th', value: stats.globalPercentiles.p75, desc: 'Top quarter' },
              { label: '90th', value: stats.globalPercentiles.p90, desc: 'Top 10%' },
              { label: '95th', value: stats.globalPercentiles.p95, desc: 'Top 5%' }
            ].map((percentile, index) => (
              <motion.div
                key={index}
                className="text-center p-4 bg-stone-50 rounded-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="text-xs text-stone-600 mb-1">{percentile.label}</div>
                <div className="text-lg font-bold text-stone-900">
                  {formatCurrency(percentile.value)}
                </div>
                <div className="text-xs text-stone-500 mt-1">{percentile.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Yearly Trends */}
      {stats.yearlyTrends.length > 0 && (
        <motion.div
          className="card p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-stone-900 mb-1">
                Yearly Trends
              </h3>
              <p className="text-sm text-stone-600">
                How mahr amounts have changed over time
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {stats.yearlyTrends.slice(0, 6).map((trend, index) => (
              <motion.div
                key={index}
                className="p-4 bg-stone-50 rounded-xl"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="font-semibold text-stone-900">{trend.year}</div>
                <div className="text-sm text-stone-600 space-y-1">
                  <div>Median: {formatCurrency(trend.median)}</div>
                  <div>Average: {formatCurrency(trend.average)}</div>
                </div>
                <div className="text-xs text-stone-500">{trend.count} submissions</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Cultural Analysis */}
      {stats.culturalAnalysis.length > 0 && (
        <motion.div
          className="card p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-stone-900 mb-1">
                Cultural Background Analysis
              </h3>
              <p className="text-sm text-stone-600">
                Mahr patterns by cultural background (3+ submissions)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.culturalAnalysis.map((culture, index) => (
              <motion.div
                key={index}
                className="p-4 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors duration-150"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="font-semibold text-stone-900 capitalize text-sm">
                  {culture.cultural_background}
                </div>
                <div className="text-sm text-stone-600 space-y-1">
                  <div>Median: {formatCurrency(culture.median)}</div>
                  <div>Average: {formatCurrency(culture.average)}</div>
                </div>
                <div className="text-xs text-stone-500">{culture.count} submissions</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Professional Analysis */}
      {stats.professionalAnalysis.length > 0 && (
        <motion.div
          className="card p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-stone-900 mb-1">
                Professional Analysis
              </h3>
              <p className="text-sm text-stone-600">
                Mahr patterns by profession (3+ submissions)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.professionalAnalysis.map((profession, index) => (
              <motion.div
                key={index}
                className="p-4 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors duration-150"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="font-semibold text-stone-900 capitalize text-sm">
                  {profession.profession}
                </div>
                <div className="text-sm text-stone-600 space-y-1">
                  <div>Median: {formatCurrency(profession.median)}</div>
                  <div>Average: {formatCurrency(profession.average)}</div>
                </div>
                <div className="text-xs text-stone-500">{profession.count} submissions</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Asset Type Breakdown */}
      {stats.assetTypeBreakdown.length > 0 && (
        <motion.div
          className="card p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-stone-900 mb-1">
                Asset Types
              </h3>
              <p className="text-sm text-stone-600">
                Distribution and values of different mahr types
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.assetTypeBreakdown.slice(0, 8).map((asset, index) => (
              <motion.div
                key={index}
                className="text-center p-4 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors duration-150"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="text-lg font-bold text-stone-900 capitalize mb-2">
                  {asset.asset_type}
                </div>
                <div className="text-2xl font-bold text-stone-600 mb-2">
                  {asset.percentage}%
                </div>
                <div className="text-xs text-stone-600 space-y-1">
                  <div>Median: {formatCurrency(asset.medianValue)}</div>
                  <div>Average: {formatCurrency(asset.averageValue)}</div>
                </div>
                <div className="text-xs text-stone-500 mt-2">
                  {asset.count} submissions
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Call to Action */}
      <motion.div
        className="text-center card p-8 bg-stone-50"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        viewport={{ once: true }}
      >
        <h3 className="text-xl font-bold text-stone-900 mb-3">
          Help Build Better Data
        </h3>
        <p className="text-stone-600 mb-6 max-w-2xl mx-auto text-sm">
          Every submission helps create a more complete picture of mahr practices worldwide. 
          Your anonymous data contributes to community understanding.
        </p>
        <div className="flex justify-center gap-4">
          <motion.button 
            className="btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => document.getElementById('submission-form')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Add Your Data
          </motion.button>
          <motion.button 
            className="btn-secondary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchStats}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

export default StatsSection 