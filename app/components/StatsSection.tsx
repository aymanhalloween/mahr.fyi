'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, MapPin, DollarSign, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface DashboardStats {
  totalSubmissions: number
  globalMedian: number
  uniqueCountries: number
  cashPercentage: number
  regionalTrends: Array<{
    region: string
    median: number
    count: number
  }>
  assetTypeBreakdown: Array<{
    asset_type: string
    count: number
    percentage: number
  }>
}

const StatsSection = () => {
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
        values[Math.floor(values.length / 2)] : 0

      // Count unique countries
      const uniqueCountries = new Set(
        submissions
          .map(s => s.country_code)
          .filter(c => c)
      ).size

      // Calculate cash percentage
      const cashSubmissions = submissions.filter(s => s.asset_type === 'cash').length
      const cashPercentage = totalSubmissions ? Math.round((cashSubmissions / totalSubmissions) * 100) : 0

      // Regional trends
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
          const median = sortedValues[Math.floor(sortedValues.length / 2)]
          return {
            region,
            median: Math.round(median),
            count: values.length
          }
        })
        .sort((a, b) => b.median - a.median)
        .slice(0, 4)

      // Asset type breakdown
      const assetTypeGroups = submissions.reduce((acc, submission) => {
        const type = submission.asset_type
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const assetTypeBreakdown = Object.entries(assetTypeGroups)
        .map(([asset_type, count]) => ({
          asset_type,
          count: count as number,
          percentage: totalSubmissions ? Math.round((count as number / totalSubmissions) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count)

      setStats({
        totalSubmissions: totalSubmissions || 0,
        globalMedian,
        uniqueCountries,
        cashPercentage,
        regionalTrends,
        assetTypeBreakdown
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
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
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
      value: formatCurrency(stats.globalMedian),
      label: 'Global Median',
      change: 'Across all regions'
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
          <motion.button 
            className="btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => document.getElementById('submission-form')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Submit First Entry
          </motion.button>
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
                Median mahr amounts by region
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
                  <div className="text-xs text-stone-600">
                    {formatCurrency(trend.median)} median
                  </div>
                </div>
                <div className="text-xs text-stone-500">
                  {trend.count} submissions
                </div>
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
          transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-stone-900 mb-1">
                Asset Types
              </h3>
              <p className="text-sm text-stone-600">
                Distribution of mahr types
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.assetTypeBreakdown.slice(0, 4).map((asset, index) => (
              <motion.div
                key={index}
                className="text-center p-4 bg-stone-50 rounded-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="text-lg font-bold text-stone-900 capitalize">
                  {asset.asset_type}
                </div>
                <div className="text-2xl font-bold text-stone-600">
                  {asset.percentage}%
                </div>
                <div className="text-xs text-stone-500">
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