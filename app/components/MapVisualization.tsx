'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'

const MapVisualization = () => {
  const stats = [
    { label: 'Countries', value: '47', icon: '🌍' },
    { label: 'Submissions', value: '2,847', icon: '📊' },
    { label: 'Global Median', value: '$8.5K', icon: '💰' }
  ]

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
          Global Distribution
        </h2>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto">
          Explore mahr data from communities around the world.
        </p>
      </motion.div>

      {/* Map Placeholder */}
      <motion.div 
        className="card overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        viewport={{ once: true }}
      >
        <div className="relative h-80 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-stone-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-stone-600" />
            </div>
            <h3 className="text-lg font-semibold text-stone-700 mb-2">Interactive Map</h3>
            <p className="text-sm text-stone-600">Coming soon - Global data visualization</p>
          </div>
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
        {stats.map((stat, index) => (
          <div key={index} className="card p-6 text-center">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-stone-900 mb-1">{stat.value}</div>
            <div className="text-sm text-stone-600">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export default MapVisualization 