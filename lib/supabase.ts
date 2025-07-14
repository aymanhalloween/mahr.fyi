import { createClient } from '@supabase/supabase-js'
import { normalizeLocation } from './locationNormalizer'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xeqvkvmywbvuthtssrfy.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlcXZrdm15d2J2dXRodHNzcmZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1Mjg3OTIsImV4cCI6MjA2NTEwNDc5Mn0.32O-K-TLTzbHqHzSbI8nzG7HNYw2CSx4VjwdVWbVJmc'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Supabase environment variables not found. Using fallback credentials.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test connection function
export async function testSupabaseConnection() {
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' }
  }
  
  try {
    // Try to access the submissions table
    const { data, error } = await supabase
      .from('submissions')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('Supabase connection test failed:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, message: 'Connection successful' }
  } catch (err) {
    console.error('Supabase connection test error:', err)
    return { success: false, error: 'Connection failed' }
  }
}

// Database types
export interface SubmissionData {
  id?: string
  asset_type: string
  cash_amount?: number | null
  cash_currency?: string | null
  asset_description?: string | null
  estimated_value?: number | null
  estimated_value_currency?: string | null
  location: string
  country_code?: string | null
  region?: string | null
  cultural_background?: string | null
  profession?: string | null
  marriage_year?: number | null
  story?: string | null
  family_pressure_level?: number | null
  negotiated?: boolean
  created_at?: string
  updated_at?: string
}

// Helper function to submit form data
export async function submitMahrData(data: Omit<SubmissionData, 'id' | 'created_at' | 'updated_at'>) {
  try {
    if (!supabase) {
      throw new Error('Supabase client is not initialized. Please check your environment variables.')
    }

    // Normalize location
    const norm = await normalizeLocation(data.location || '')

    // Extract country code from canonical location (fallback to old method if needed)
    const countryCode = extractCountryCode(norm.canonical) || extractCountryCode(data.location)
    const region = getRegionFromLocation(norm.canonical) || getRegionFromLocation(data.location)
    
    const { data: result, error } = await supabase
      .from('submissions')
      .insert([{
        ...data,
        location: norm.canonical,
        country_code: countryCode,
        region: region
      }])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('Submission error:', error)
    return { success: false, error }
  }
}

// Helper function to extract country code from location string
function extractCountryCode(location: string): string | null {
  const locationMap: { [key: string]: string } = {
    'uae': 'AE',
    'united arab emirates': 'AE',
    'emirates': 'AE',
    'dubai': 'AE',
    'abu dhabi': 'AE',
    'pakistan': 'PK',
    'india': 'IN',
    'bangladesh': 'BD',
    'saudi arabia': 'SA',
    'saudi': 'SA',
    'ksa': 'SA',
    'uk': 'GB',
    'united kingdom': 'GB',
    'britain': 'GB',
    'england': 'GB',
    'usa': 'US',
    'united states': 'US',
    'america': 'US',
    'canada': 'CA',
    'australia': 'AU',
    'malaysia': 'MY',
    'indonesia': 'ID',
    'turkey': 'TR',
    'egypt': 'EG',
    'lebanon': 'LB',
    'jordan': 'JO',
    'qatar': 'QA',
    'kuwait': 'KW',
    'bahrain': 'BH',
    'oman': 'OM'
  }

  const normalizedLocation = location.toLowerCase().trim()
  
  for (const [country, code] of Object.entries(locationMap)) {
    if (normalizedLocation.includes(country)) {
      return code
    }
  }
  
  return null
}

// Helper function to determine region from location
function getRegionFromLocation(location: string): string | null {
  const regionMap: { [key: string]: string[] } = {
    'middle east': ['uae', 'saudi', 'qatar', 'kuwait', 'bahrain', 'oman', 'dubai', 'abu dhabi'],
    'south asia': ['pakistan', 'india', 'bangladesh', 'sri lanka'],
    'north america': ['usa', 'canada', 'united states', 'america'],
    'europe': ['uk', 'britain', 'england', 'germany', 'france', 'netherlands'],
    'southeast asia': ['malaysia', 'indonesia', 'singapore', 'thailand'],
    'oceania': ['australia', 'new zealand']
  }

  const normalizedLocation = location.toLowerCase().trim()
  
  for (const [region, countries] of Object.entries(regionMap)) {
    if (countries.some(country => normalizedLocation.includes(country))) {
      return region
    }
  }
  
  return null
}

// Function to get analytics data
export async function getAnalyticsData() {
  try {
    if (!supabase) {
      throw new Error('Supabase client is not initialized. Please check your environment variables.')
    }

    const { data, error } = await supabase
      .from('submission_analytics')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return { success: false, error }
  }
} 