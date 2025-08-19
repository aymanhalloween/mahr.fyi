'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'
import { supabase } from '../../lib/supabase'
import { normalizeLocation } from '../../lib/locationNormalizer'
import { ArrowLeft, TrendingUp, MapPin, Globe, BarChart3 } from 'lucide-react'
import Link from 'next/link'

interface LocationData {
  location: string
  count: number
  averageValue: number
  medianValue: number
  totalValue: number
  submissions: any[]
}

interface RegionData {
  region: string
  count: number
  averageValue: number
  percentage: number
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#84cc16']

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`
  } else {
    return `$${amount.toLocaleString()}`
  }
}

export default function DistributionPage() {
  const [locationData, setLocationData] = useState<LocationData[]>([])
  const [regionData, setRegionData] = useState<RegionData[]>([])
  const [loading, setLoading] = useState(true)
  const [totalSubmissions, setTotalSubmissions] = useState(0)
  const [selectedChart, setSelectedChart] = useState<'location' | 'region'>('location')

  useEffect(() => {
    fetchDistributionData()
  }, [])

  const fetchDistributionData = async () => {
    try {
      setLoading(true)
      
      if (!supabase) {
        console.warn('Supabase client not available')
        return
      }

      // Fetch all submissions
      const { data: submissions } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false })

      if (!submissions) {
        setLoading(false)
        return
      }

      setTotalSubmissions(submissions.length)

      // Normalize locations and group data
      const normalizedSubs = await Promise.all(submissions.map(async (sub: any) => {
        const norm = await normalizeLocation(sub.location || '')
        return {
          ...sub,
          canonical_location: norm.canonical,
        }
      }))

      // Group by location
      const locationGroups: Record<string, any[]> = {}
      normalizedSubs.forEach((sub: any) => {
        const loc = sub.canonical_location || 'Unknown'
        if (!locationGroups[loc]) locationGroups[loc] = []
        locationGroups[loc].push(sub)
      })

      // Calculate location statistics
      const locationStats: LocationData[] = Object.entries(locationGroups)
        .map(([location, subs]) => {
          const values = subs
            .map(s => s.asset_type === 'cash' ? s.cash_amount : s.estimated_value)
            .filter(v => v && v > 0)
            .sort((a, b) => a - b)

          const averageValue = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
          const medianValue = values.length > 0 ? 
            values.length % 2 === 0 
              ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
              : values[Math.floor(values.length / 2)]
            : 0
          const totalValue = values.reduce((a, b) => a + b, 0)

          return {
            location,
            count: subs.length,
            averageValue: Math.round(averageValue),
            medianValue: Math.round(medianValue),
            totalValue: Math.round(totalValue),
            submissions: subs
          }
        })
        .filter(stat => stat.count >= 2) // Only show locations with 2+ submissions
        .sort((a, b) => b.count - a.count)
        .slice(0, 10) // Top 10 locations

      setLocationData(locationStats)

      // Group by region
      const regionGroups: Record<string, any[]> = {}
      normalizedSubs.forEach((sub: any) => {
        const region = sub.region || 'Other'
        if (!regionGroups[region]) regionGroups[region] = []
        regionGroups[region].push(sub)
      })

      // Calculate region statistics
      const regionStats: RegionData[] = Object.entries(regionGroups)
        .map(([region, subs]) => {
          const values = subs
            .map(s => s.asset_type === 'cash' ? s.cash_amount : s.estimated_value)
            .filter(v => v && v > 0)

          const averageValue = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
          const percentage = (subs.length / normalizedSubs.length) * 100

          return {
            region: region === 'Other' ? 'Other Regions' : region.charAt(0).toUpperCase() + region.slice(1),
            count: subs.length,
            averageValue: Math.round(averageValue),
            percentage: Math.round(percentage * 10) / 10
          }
        })
        .filter(stat => stat.count >= 1)
        .sort((a, b) => b.count - a.count)

      setRegionData(regionStats)

    } catch (error) {
      console.error('Error fetching distribution data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-stone-600">Loading distribution data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
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
            Geographic Distribution
          </span>
        </div>
      </motion.nav>

      {/* Main Content */}
      <motion.div 
        className="py-16 px-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div className="mb-12 text-center" variants={fadeInUp}>
            <h1 className="text-5xl font-bold text-stone-900 mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Global Distribution
            </h1>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto mb-6">
              Explore how mahr varies across different countries and regions worldwide. 
              See where our community is contributing data from and discover geographic patterns.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-stone-500">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>{totalSubmissions} total submissions</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{locationData.length} countries with 2+ submissions</span>
              </div>
            </div>
          </motion.div>

          {/* Chart Toggle */}
          <motion.div className="mb-8 flex justify-center" variants={fadeInUp}>
            <div className="bg-white rounded-xl p-1 shadow-lg border border-stone-200">
              <button
                onClick={() => setSelectedChart('location')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedChart === 'location'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-stone-600 hover:text-purple-600'
                }`}
              >
                By Country
              </button>
              <button
                onClick={() => setSelectedChart('region')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedChart === 'region'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-stone-600 hover:text-purple-600'
                }`}
              >
                By Region
              </button>
            </div>
          </motion.div>

          {/* Charts Section */}
          {selectedChart === 'location' && (
            <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12" variants={fadeInUp}>
              {/* Submissions by Country Bar Chart */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-stone-200">
                <h3 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                  Submissions by Country
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={locationData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="location" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                      stroke="#64748b"
                    />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value: any, name: string) => [
                        name === 'count' ? `${value} submissions` : value,
                        name === 'count' ? 'Total Submissions' : name
                      ]}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#8b5cf6" 
                      radius={[4, 4, 0, 0]}
                      name="count"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Average Mahr by Country */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-stone-200">
                <h3 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  Average Mahr by Country
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={locationData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="location" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                      stroke="#64748b"
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={12}
                      tickFormatter={formatCurrency}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value: any) => [formatCurrency(value), 'Average Mahr']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="averageValue" 
                      stroke="#06b6d4" 
                      strokeWidth={3}
                      dot={{ fill: '#06b6d4', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: '#06b6d4', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {selectedChart === 'region' && (
            <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12" variants={fadeInUp}>
              {/* Regional Distribution Pie Chart */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-stone-200">
                <h3 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                  <Globe className="w-6 h-6 text-purple-600" />
                  Regional Distribution
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={regionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ region, percentage }) => `${region}: ${percentage}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {regionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value: any, name: string) => [
                        `${value} submissions (${regionData.find(r => r.count === value)?.percentage}%)`,
                        'Count'
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Regional Average Bar Chart */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-stone-200">
                <h3 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                  Average Mahr by Region
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={regionData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="region" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                      stroke="#64748b"
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={12}
                      tickFormatter={formatCurrency}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value: any) => [formatCurrency(value), 'Average Mahr']}
                    />
                    <Bar 
                      dataKey="averageValue" 
                      fill="#10b981" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Data Table */}
          <motion.div className="bg-white rounded-2xl p-8 shadow-xl border border-stone-200 mb-12" variants={fadeInUp}>
            <h3 className="text-2xl font-bold text-stone-900 mb-6">
              {selectedChart === 'location' ? 'Country Statistics' : 'Regional Statistics'}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left py-4 px-2 font-semibold text-stone-700">
                      {selectedChart === 'location' ? 'Country' : 'Region'}
                    </th>
                    <th className="text-right py-4 px-2 font-semibold text-stone-700">Submissions</th>
                    <th className="text-right py-4 px-2 font-semibold text-stone-700">Average Mahr</th>
                    {selectedChart === 'location' && (
                      <th className="text-right py-4 px-2 font-semibold text-stone-700">Median Mahr</th>
                    )}
                    {selectedChart === 'region' && (
                      <th className="text-right py-4 px-2 font-semibold text-stone-700">Percentage</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(selectedChart === 'location' ? locationData : regionData).map((item, index) => (
                    <tr key={index} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                      <td className="py-4 px-2 font-medium text-stone-900">
                        {'location' in item ? item.location : item.region}
                      </td>
                      <td className="py-4 px-2 text-right text-stone-600">{item.count}</td>
                      <td className="py-4 px-2 text-right text-stone-600">{formatCurrency(item.averageValue)}</td>
                      {selectedChart === 'location' && 'medianValue' in item && (
                        <td className="py-4 px-2 text-right text-stone-600">{formatCurrency(item.medianValue)}</td>
                      )}
                      {selectedChart === 'region' && 'percentage' in item && (
                        <td className="py-4 px-2 text-right text-stone-600">{item.percentage}%</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Back to Home */}
          <motion.div className="flex justify-center" variants={fadeInUp}>
            <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all text-lg">
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
