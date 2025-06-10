'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, ChevronDown, Heart, Scale, Shield, Users } from 'lucide-react'

const EducationalSection = () => {
  const [expandedCard, setExpandedCard] = useState<number | null>(null)

  const educationalCards = [
    {
      id: 1,
      icon: Heart,
      title: "What is Mahr?",
      summary: "A fundamental part of Islamic marriage contracts",
      content: "Mahr is a mandatory Islamic dower given by the groom to the bride. It serves as a symbol of commitment and financial security."
    },
    {
      id: 2,
      icon: Scale,
      title: "Types of Mahr",
      summary: "Cash, gold, jewelry, property, and other forms",
      content: "Mahr can take various forms including cash, gold jewelry, real estate, or other valuable assets based on cultural preferences."
    },
    {
      id: 3,
      icon: Users,
      title: "Cultural Variations",
      summary: "Practices differ across regions and communities",
      content: "Mahr practices vary significantly across different Muslim communities worldwide, reflecting local customs and traditions."
    },
    {
      id: 4,
      icon: Shield,
      title: "Legal & Ethical Aspects",
      summary: "Rights, protections, and modern considerations",
      content: "Mahr is the bride's absolute right and provides financial security. Modern interpretations emphasize reasonable amounts."
    }
  ]

  const toggleCard = (cardId: number) => {
    setExpandedCard(expandedCard === cardId ? null : cardId)
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
          Understanding Mahr
        </h2>
        <p className="text-lg text-stone-600 max-w-3xl mx-auto">
          Learn about the significance and modern perspectives on this Islamic tradition.
        </p>
      </motion.div>

      {/* Educational Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {educationalCards.map((card, index) => (
          <motion.div
            key={card.id}
            className="card p-6 cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
            viewport={{ once: true }}
            whileHover={{ y: -2 }}
            onClick={() => toggleCard(card.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                  <card.icon className="w-5 h-5 text-stone-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 text-sm mb-1">
                    {card.title}
                  </h3>
                  <p className="text-xs text-stone-600">
                    {card.summary}
                  </p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: expandedCard === card.id ? 180 : 0 }}
                transition={{ duration: 0.15 }}
              >
                <ChevronDown className="w-4 h-4 text-stone-400" />
              </motion.div>
            </div>

            <AnimatePresence>
              {expandedCard === card.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 border-t border-stone-200">
                    <p className="text-sm text-stone-700 leading-relaxed">
                      {card.content}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* FAQ Section */}
      <motion.div
        className="card p-8 bg-stone-50"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        viewport={{ once: true }}
      >
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6 text-stone-600" />
          <h3 className="text-xl font-bold text-stone-900">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-4">
          <div className="border-b border-stone-200 pb-4">
            <h4 className="font-semibold text-stone-900 mb-2 text-sm">
              How does mahr.fyi ensure data privacy?
            </h4>
            <p className="text-stone-600 text-xs">
              All submissions are completely anonymous. We never collect identifying information.
            </p>
          </div>

          <div className="border-b border-stone-200 pb-4">
            <h4 className="font-semibold text-stone-900 mb-2 text-sm">
              What makes this data different?
            </h4>
            <p className="text-stone-600 text-xs">
              Our data comes directly from community members with real experiences.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-stone-900 mb-2 text-sm">
              How can this help families?
            </h4>
            <p className="text-stone-600 text-xs">
              Transparent data helps families make informed decisions and set realistic expectations.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default EducationalSection 