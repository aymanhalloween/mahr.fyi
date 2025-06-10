'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Quote, Star, MapPin, Heart } from 'lucide-react'

const CommunityReflections = () => {
  const reflections = [
    {
      id: 1,
      content: "This platform helped my family have honest conversations about mahr without the awkwardness. Having real data made everything more transparent.",
      location: "Toronto, Canada",
      year: "2023",
      rating: 5
    },
    {
      id: 2,
      content: "As someone from a mixed cultural background, seeing how different communities approach mahr gave me confidence in my own decisions.",
      location: "London, UK",
      year: "2024",
      rating: 5
    },
    {
      id: 3,
      content: "The regional data helped us understand what was reasonable in our area. It prevented unrealistic expectations.",
      location: "Dubai, UAE",
      year: "2023",
      rating: 5
    }
  ]

  const stats = [
    { value: "94%", label: "Found Data Helpful" },
    { value: "89%", label: "Improved Conversations" },
    { value: "76%", label: "Reduced Family Stress" }
  ]

  return (
    <div className="space-y-8" id="share-story-section">
      {/* Header */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-bold text-stone-900 mb-3">
          Community Reflections
        </h2>
        <p className="text-lg text-stone-600 max-w-3xl mx-auto">
          Real stories from families who found transparency in their mahr conversations.
        </p>
      </motion.div>

      {/* Impact Stats */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        viewport={{ once: true }}
      >
        {stats.map((stat, index) => (
          <div key={index} className="text-center card p-6">
            <div className="text-3xl font-bold text-stone-900 mb-2">
              {stat.value}
            </div>
            <div className="text-sm text-stone-600 font-medium">
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Testimonial Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        viewport={{ once: true }}
      >
        {reflections.map((reflection, index) => (
          <motion.div
            key={reflection.id}
            className="card p-6 relative group"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
            viewport={{ once: true }}
            whileHover={{ y: -2 }}
          >
            {/* Quote Icon */}
            <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Quote className="w-8 h-8 text-stone-600" />
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-3">
              {[...Array(reflection.rating)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              ))}
            </div>

            {/* Content */}
            <blockquote className="text-sm text-stone-700 leading-relaxed mb-4">
              "{reflection.content}"
            </blockquote>

            {/* Meta Information */}
            <div className="space-y-1 text-xs text-stone-500">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{reflection.location}</span>
              </div>
              <div>{reflection.year}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Call to Action */}
      <motion.div
        className="text-center card p-8 bg-stone-900 text-white relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        viewport={{ once: true }}
      >
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/20 mb-6">
            <Heart className="w-4 h-4" />
            <span className="text-sm font-medium">Join the Community</span>
          </div>

          <h3 className="text-2xl font-bold mb-3">
            Share Your Story
          </h3>
          <p className="text-stone-300 mb-6 max-w-2xl mx-auto text-sm">
            Help other families by sharing your experience. Your anonymous story could provide comfort and guidance to someone navigating their own mahr conversations.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.button 
              className="bg-white text-stone-900 px-6 py-3 rounded-full font-medium hover:bg-stone-100 transition-colors duration-150"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              Share Your Experience
            </motion.button>
            <motion.button 
              className="border border-white/30 text-white px-6 py-3 rounded-full font-medium hover:bg-white/10 transition-colors duration-150"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              Read More Stories
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default CommunityReflections 