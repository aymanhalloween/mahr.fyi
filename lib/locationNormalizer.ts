import stringSimilarity from 'string-similarity'

const LOCATION_ALIASES: Record<string, string> = {
  // US
  'usa': 'United States',
  'us': 'United States',
  'america': 'United States',
  'u.s.': 'United States',
  'u.s.a.': 'United States',
  'california': 'California, United States',
  'cali': 'California, United States',
  'nyc': 'New York, United States',
  'new york': 'New York, United States',
  // UK
  'uk': 'United Kingdom',
  'u.k.': 'United Kingdom',
  'england': 'United Kingdom',
  'london': 'London, United Kingdom',
  // Pakistan
  'pk': 'Pakistan',
  // Add more as needed...
}

const CANONICAL_LOCATIONS = [
  'United States',
  'California, United States',
  'New York, United States',
  'United Kingdom',
  'London, United Kingdom',
  'Pakistan',
  'India',
  'UAE',
  'Dubai, UAE',
  'Canada',
  'Australia',
  'Bangladesh',
  'Nigeria',
  'Egypt',
  'Lebanon',
  'Jordan',
  'Turkey',
  'Malaysia',
  'Indonesia',
  'Qatar',
  'Kuwait',
  'Bahrain',
  'Oman',
  'France',
  'Germany',
  'Netherlands',
]

// Dummy lookup for canonical locations to lat/lng
const GEO_LOOKUP: Record<string, [number, number]> = {
  'United States': [37.0902, -95.7129],
  'California, United States': [36.7783, -119.4179],
  'New York, United States': [40.7128, -74.0060],
  'United Kingdom': [55.3781, -3.4360],
  'London, United Kingdom': [51.5074, -0.1278],
  'Pakistan': [30.3753, 69.3451],
  'India': [20.5937, 78.9629],
  'UAE': [23.4241, 53.8478],
  'Dubai, UAE': [25.2048, 55.2708],
  'Canada': [56.1304, -106.3468],
  'Australia': [-25.2744, 133.7751],
  'Bangladesh': [23.685, 90.3563],
  'Nigeria': [9.082, 8.6753],
  'Egypt': [26.8206, 30.8025],
  'Lebanon': [33.8547, 35.8623],
  'Jordan': [30.5852, 36.2384],
  'Turkey': [38.9637, 35.2433],
  'Malaysia': [4.2105, 101.9758],
  'Indonesia': [-0.7893, 113.9213],
  'Qatar': [25.3548, 51.1839],
  'Kuwait': [29.3117, 47.4818],
  'Bahrain': [25.9304, 50.6378],
  'Oman': [21.4735, 55.9754],
  'France': [46.6034, 1.8883],
  'Germany': [51.1657, 10.4515],
  'Netherlands': [52.1326, 5.2913],
}

export async function normalizeLocation(input: string): Promise<{ canonical: string, latlng: [number, number] | null }> {
  const cleaned = input.trim().toLowerCase().replace(/[.,]/g, '')
  // 1. Alias dictionary
  if (LOCATION_ALIASES[cleaned]) {
    const canonical = LOCATION_ALIASES[cleaned]
    return { canonical, latlng: GEO_LOOKUP[canonical] || null }
  }
  // 2. Fuzzy match
  const matchResult = stringSimilarity.findBestMatch(cleaned, CANONICAL_LOCATIONS.map(l => l.toLowerCase()))
  if (matchResult.bestMatch.rating > 0.7) {
    const canonical = CANONICAL_LOCATIONS[matchResult.bestMatchIndex]
    return { canonical, latlng: GEO_LOOKUP[canonical] || null }
  }
  // 3. Geocoding API fallback
  // TODO: Replace with your geocoding API key and endpoint
  // Example: OpenCage, Mapbox, Google Geocoding
  // For now, just return the input capitalized
  return {
    canonical: input
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' '),
    latlng: null
  }
} 