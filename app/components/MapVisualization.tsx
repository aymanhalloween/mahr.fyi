'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import { normalizeLocation, COUNTRY_COORDINATES } from '../../lib/locationNormalizer'

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
  commonType: string
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

const MapVisualization = () => {
  const [groups, setGroups] = useState<GroupData[]>([])
  const [stats, setStats] = useState({countries: 0, submissions: 0, globalMedian: 0})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      if (!supabase) {
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
          const avg = subs.reduce((sum: number, s: any) => sum + (s.cash_amount || 0), 0) / subs.length
          const typeCounts: Record<string, number> = {}
          subs.forEach((s: any) => {
            const type = s.asset_type || 'Unknown'
            typeCounts[type] = (typeCounts[type] || 0) + 1
          })
          const mostCommonType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'
          return {
            location: loc,
            count: subs.length,
            avgAmount: avg,
            commonType: mostCommonType,
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
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution="&copy; <a href='https://carto.com/attributions'>CARTO</a> | &copy; OpenStreetMap contributors"
            />
            {groups.map((group, idx) => (
              <Marker key={idx} position={group.latlng} icon={createConcentricIcon()}>
                <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent={false} interactive>
                  <div style={{ minWidth: 180 }}>
                    <div className="font-semibold text-base mb-1">{group.location}</div>
                    <div className="text-sm">Submissions: <b>{group.count}</b></div>
                    <div className="text-sm">Avg. Amount: <b>{formatCurrency(group.avgAmount)}</b></div>
                    <div className="text-sm">Common Type: <b>{group.commonType}</b></div>
                  </div>
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        viewport={{ once: true }}
      >
        <div className="card p-6 text-center">
          <div className="text-2xl mb-2">🌍</div>
          <div className="text-2xl font-bold text-stone-900 mb-1">{stats.countries}</div>
          <div className="text-sm text-stone-600">Countries</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-2xl mb-2">📊</div>
          <div className="text-2xl font-bold text-stone-900 mb-1">{stats.submissions}</div>
          <div className="text-sm text-stone-600">Global Submissions</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-2xl mb-2">💰</div>
          <div className="text-2xl font-bold text-stone-900 mb-1">{formatCurrency(stats.globalMedian)}</div>
          <div className="text-sm text-stone-600">Global Median</div>
        </div>
      </motion.div>
    </div>
  )
}

export default MapVisualization 