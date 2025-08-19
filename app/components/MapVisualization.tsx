'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import { normalizeLocation, COUNTRY_COORDINATES } from '../../lib/locationNormalizer'
import { createPortal } from 'react-dom'

function getLatLng(location: string): [number, number] {
  return COUNTRY_COORDINATES[location] || [20, 0] // fallback: center of world
}

function formatCurrency(amount: number) {
  return `$${Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(amount)}`
}

interface GroupData {
  location: string
  count: number
  avgAmount: number
  medianAmount: number
  standardDeviation: number
  percentiles: {
    p25: number
    p50: number
    p75: number
    p90: number
    p95: number
  }
  commonType: string
  yearlyTrends: Array<{
    year: number
    median: number
    count: number
  }>
  latlng: [number, number]
}

// Add CSS for concentric circle marker
const markerStyle = `
  .concentric-marker {
    position: relative;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .concentric-marker .circle1 {
    position: absolute;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: rgba(99, 102, 241, 0.25);
    border: 2px solid #6366f1;
  }
  .concentric-marker .circle2 {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(99, 102, 241, 0.5);
    border: 2px solid #6366f1;
  }
  .concentric-marker .circle3 {
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #6366f1;
    border: 1.5px solid #fff;
  }
`
if (typeof window !== 'undefined' && !document.getElementById('concentric-marker-style')) {
  const style = document.createElement('style')
  style.id = 'concentric-marker-style'
  style.innerHTML = markerStyle
  document.head.appendChild(style)
}

function createConcentricIcon() {
  return L.divIcon({
    className: '',
    html: `
      <div class='concentric-marker'>
        <div class='circle1'></div>
        <div class='circle2'></div>
        <div class='circle3'></div>
      </div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -9],
    tooltipAnchor: [0, -9],
  })
}

function CountryModal({ show, onClose, country }: { show: boolean, onClose: () => void, country: GroupData | null }) {
  if (!show || !country) return null
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50">
      <motion.div 
        className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-stone-900 mb-2">{country.location}</h2>
            <p className="text-stone-600">Detailed mahr statistics and trends</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center hover:bg-stone-200 transition-colors"
          >
            ✕
          </button>
        </div>
        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 bg-stone-50 rounded-xl">
            <div className="text-sm text-stone-600 mb-1">Submissions</div>
            <div className="text-2xl font-bold text-stone-900">{country.count}</div>
          </div>
          <div className="text-center p-4 bg-stone-50 rounded-xl">
            <div className="text-sm text-stone-600 mb-1">Median</div>
            <div className="text-xl font-bold text-stone-900">{formatCurrency(country.medianAmount)}</div>
          </div>
          <div className="text-center p-4 bg-stone-50 rounded-xl">
            <div className="text-sm text-stone-600 mb-1">Average</div>
            <div className="text-xl font-bold text-stone-900">{formatCurrency(country.avgAmount)}</div>
          </div>
          <div className="text-center p-4 bg-stone-50 rounded-xl">
            <div className="text-sm text-stone-600 mb-1">Common Type</div>
            <div className="text-sm font-semibold text-stone-900 capitalize">{country.commonType}</div>
          </div>
        </div>
        {/* Percentile Distribution */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-stone-900 mb-4">Distribution Percentiles</h3>
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: '25th', value: country.percentiles.p25, desc: 'Bottom quarter' },
              { label: '50th', value: country.percentiles.p50, desc: 'Median' },
              { label: '75th', value: country.percentiles.p75, desc: 'Top quarter' },
              { label: '90th', value: country.percentiles.p90, desc: 'Top 10%' },
              { label: '95th', value: country.percentiles.p95, desc: 'Top 5%' }
            ].map((percentile, index) => (
              <div key={index} className="text-center p-3 bg-stone-50 rounded-lg">
                <div className="text-xs text-stone-600 mb-1">{percentile.label}</div>
                <div className="text-sm font-bold text-stone-900">
                  {formatCurrency(percentile.value)}
                </div>
                <div className="text-xs text-stone-500 mt-1">{percentile.desc}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Yearly Trends */}
        {country.yearlyTrends.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-stone-900 mb-4">Yearly Trends</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {country.yearlyTrends.slice(0, 6).map((trend, index) => (
                <div key={index} className="p-3 bg-stone-50 rounded-lg">
                  <div className="font-semibold text-stone-900">{trend.year}</div>
                  <div className="text-sm text-stone-600">
                    Median: {formatCurrency(trend.median)}
                  </div>
                  <div className="text-xs text-stone-500">{trend.count} submissions</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Statistical Metrics */}
        <div className="bg-stone-50 rounded-xl p-4">
          <h4 className="font-semibold text-stone-900 mb-2">Statistical Metrics</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-stone-600">Standard Deviation:</span>
              <span className="font-semibold text-stone-900 ml-2">
                {formatCurrency(country.standardDeviation)}
              </span>
            </div>
            <div>
              <span className="text-stone-600">Range:</span>
              <span className="font-semibold text-stone-900 ml-2">
                {formatCurrency(country.percentiles.p25)} - {formatCurrency(country.percentiles.p95)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}

const MapVisualization = () => {
  const [groups, setGroups] = useState<GroupData[]>([])
  const [stats, setStats] = useState({countries: 0, submissions: 0, globalMedian: 0})
  const [loading, setLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState<GroupData | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      if (!supabase) {
        console.error('Supabase client not initialized')
        setLoading(false)
        return
      }
      
      try {
        const { data: submissions } = await supabase
          .from('submissions')
          .select('*')
        
        if (!submissions) {
          setLoading(false)
          return
        }

        // Normalize all locations
        const normalizedSubs = await Promise.all(submissions.map(async (sub: any) => {
          const norm = await normalizeLocation(sub.location || '')
          return {
            ...sub,
            canonical_location: norm.canonical,
            latlng: norm.latlng,
          }
        }))

        // Grouping logic (by canonical_location)
        const locationGroups: Record<string, any[]> = {}
        normalizedSubs.forEach((sub: any) => {
          const loc = sub.canonical_location || 'Unknown'
          if (!locationGroups[loc]) locationGroups[loc] = []
          locationGroups[loc].push(sub)
        })

        // Aggregate for each group
        const groupData: GroupData[] = Object.entries(locationGroups).map(([loc, subs]) => {
          const values = subs.map((s: any) => s.cash_amount || s.estimated_value || 0).filter(v => v > 0).sort((a, b) => a - b)
          const avg = values.length > 0 ? values.reduce((sum: number, v: number) => sum + v, 0) / values.length : 0
          const median = values.length > 0 ? 
            (values.length % 2 === 0 
              ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
              : values[Math.floor(values.length / 2)]) : 0
          
          // Calculate standard deviation
          const variance = values.length > 0 ? 
            values.reduce((acc: number, val: number) => acc + Math.pow(val - avg, 2), 0) / values.length : 0
          const standardDeviation = Math.sqrt(variance)

          // Calculate percentiles
          const percentiles = {
            p25: values.length > 0 ? values[Math.floor(values.length * 0.25)] || 0 : 0,
            p50: median,
            p75: values.length > 0 ? values[Math.floor(values.length * 0.75)] || 0 : 0,
            p90: values.length > 0 ? values[Math.floor(values.length * 0.9)] || 0 : 0,
            p95: values.length > 0 ? values[Math.floor(values.length * 0.95)] || 0 : 0
          }

          // Get yearly trends for this location
          const yearlyGroups = subs.reduce((acc: any, s: any) => {
            const year = s.marriage_year
            if (!year || year < 2010) return acc
            if (!acc[year]) acc[year] = []
            const value = s.cash_amount || s.estimated_value
            if (value && value > 0) acc[year].push(value)
            return acc
          }, {} as Record<number, number[]>)

          const yearlyTrends = Object.entries(yearlyGroups).map(([year, yearValues]: [string, any]) => {
            const sortedYearValues = [...yearValues].sort((a: number, b: number) => a - b)
            const yearMedian = sortedYearValues.length % 2 === 0 
              ? (sortedYearValues[sortedYearValues.length / 2 - 1] + sortedYearValues[sortedYearValues.length / 2]) / 2
              : sortedYearValues[Math.floor(sortedYearValues.length / 2)]
            return {
              year: parseInt(year),
              median: Math.round(yearMedian),
              count: yearValues.length
            }
          }).sort((a, b) => b.year - a.year)

          const typeCounts: Record<string, number> = {}
          subs.forEach((s: any) => {
            const type = s.asset_type || 'Unknown'
            typeCounts[type] = (typeCounts[type] || 0) + 1
          })
          const mostCommonType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'
          
          return {
            location: loc,
            count: subs.length,
            avgAmount: Math.round(avg),
            medianAmount: Math.round(median),
            standardDeviation: Math.round(standardDeviation),
            percentiles: {
              p25: Math.round(percentiles.p25),
              p50: Math.round(percentiles.p50),
              p75: Math.round(percentiles.p75),
              p90: Math.round(percentiles.p90),
              p95: Math.round(percentiles.p95)
            },
            commonType: mostCommonType,
            yearlyTrends,
            latlng: subs[0].latlng || [20, 0],
          }
        })

        setGroups(groupData)
        
        // Stats
        const uniqueLocations = new Set(normalizedSubs.map((s: any) => s.canonical_location)).size
        const allAmounts = normalizedSubs.map((s: any) => s.cash_amount).filter(Boolean).sort((a: number, b: number) => a - b)
        const globalMedian = allAmounts.length ? allAmounts[Math.floor(allAmounts.length / 2)] : 0
        setStats({countries: uniqueLocations, submissions: normalizedSubs.length, globalMedian})
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <motion.div className="text-center">
          <h2 className="text-3xl font-bold text-stone-900 mb-3">Global Submissions</h2>
          <p className="text-lg text-stone-600">Loading map data...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-bold text-stone-900 mb-3">
          Global Submissions
        </h2>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto">
          Explore how mahr practices vary across different regions worldwide.
        </p>
      </motion.div>

      {/* Interactive Map */}
      <motion.div 
        className="card overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        viewport={{ once: true }}
      >
        <div className="relative h-80">
          <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
            <TileLayer
              url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            {groups.map((group, idx) => (
              <Marker 
                key={idx} 
                position={group.latlng} 
                icon={createConcentricIcon()}
                eventHandlers={{
                  click: () => {
                    setSelectedCountry(group)
                    setShowModal(true)
                  }
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                  <div className="text-sm">
                    <div className="font-semibold text-stone-900 mb-1">{group.location}</div>
                    <div className="text-stone-600 space-y-1">
                      <div>Median: {formatCurrency(group.medianAmount)}</div>
                      <div>Average: {formatCurrency(group.avgAmount)}</div>
                      <div>Count: {group.count}</div>
                      <div className="text-xs text-stone-500 mt-1">Click for details</div>
                    </div>
                  </div>
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </motion.div>

      {/* Country Detail Modal */}
      <CountryModal show={showModal} onClose={() => setShowModal(false)} country={selectedCountry} />
    </div>
  )
}

export default MapVisualization 