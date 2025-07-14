// Centralized constants for all numerical values across the platform
// This ensures consistency and provides a single source of truth

export const CURRENCY_FORMATTING = {
  // Thresholds for currency formatting (in USD)
  K_THRESHOLD: 1000,
  M_THRESHOLD: 1000000,
  B_THRESHOLD: 1000000000,
} as const

export const FORM_PLACEHOLDERS = {
  // Default placeholder amounts for forms
  CASH_AMOUNT: '50,000 or $50,000',
  ESTIMATED_VALUE: '25,000 or $25,000',
  MAHR_AMOUNT: '50,000 or $50,000',
} as const

export const YEAR_CONSTRAINTS = {
  // Year validation constraints
  MIN_YEAR: 1950,
  MAX_YEAR_OFFSET: 1, // Current year + this offset
} as const

export const STATISTICAL_THRESHOLDS = {
  // Thresholds for statistical analysis
  LOWER_BOUND_PERCENTAGE: 70, // 30% below median
  UPPER_BOUND_PERCENTAGE: 130, // 30% above median
  MIN_SUBMISSIONS_FOR_ANALYSIS: 3, // Minimum submissions needed for meaningful analysis
} as const

export const CURRENCY_EXCHANGE_RATES = {
  // Exchange rates for currency conversion (to USD)
  // These should be updated regularly or fetched from an API
  AED: 0.27,
  SAR: 0.27,
  PKR: 0.0036,
  INR: 0.012,
  USD: 1,
  EUR: 1.09,
  GBP: 1.27,
  CAD: 0.74,
  AUD: 0.66,
  JPY: 0.0067,
  CNY: 0.14,
  KRW: 0.00075,
  SGD: 0.74,
  MYR: 0.21,
  IDR: 0.000064,
  THB: 0.028,
  PHP: 0.018,
  VND: 0.000041,
  TRY: 0.031,
  EGP: 0.032,
  NGN: 0.0011,
  KES: 0.0069,
  ZAR: 0.054,
  BRL: 0.21,
  MXN: 0.058,
  ARS: 0.0012,
  CLP: 0.0011,
  PEN: 0.27,
  COP: 0.00025,
  UYU: 0.026,
} as const

export const UI_CONSTANTS = {
  // UI-related constants
  PERSPECTIVE_DISTANCE: 1000, // CSS perspective value
  ANIMATION_DURATION: 2000, // Default animation duration in ms
  DEBOUNCE_DELAY: 200, // Debounce delay for search inputs
} as const

export const VALIDATION_RULES = {
  // Validation rules for form inputs
  MIN_AMOUNT: 1, // Minimum valid amount
  MAX_AMOUNT: 1000000000, // Maximum valid amount (1 billion)
  MIN_YEAR: YEAR_CONSTRAINTS.MIN_YEAR,
} as const

// Helper function to get current max year
export const getMaxYear = (): number => {
  return new Date().getFullYear() + YEAR_CONSTRAINTS.MAX_YEAR_OFFSET
}

// Helper function to format currency consistently
export const formatCurrency = (amount: number): string => {
  if (amount >= CURRENCY_FORMATTING.B_THRESHOLD) {
    return `$${(amount / CURRENCY_FORMATTING.B_THRESHOLD).toFixed(1)}B`
  }
  if (amount >= CURRENCY_FORMATTING.M_THRESHOLD) {
    return `$${(amount / CURRENCY_FORMATTING.M_THRESHOLD).toFixed(1)}M`
  }
  if (amount >= CURRENCY_FORMATTING.K_THRESHOLD) {
    return `$${(amount / CURRENCY_FORMATTING.K_THRESHOLD).toFixed(1)}K`
  }
  return `$${amount.toLocaleString()}`
}

// Helper function to validate year
export const isValidYear = (year: number): boolean => {
  return year >= VALIDATION_RULES.MIN_YEAR && year <= getMaxYear()
}

// Helper function to validate amount
export const isValidAmount = (amount: number): boolean => {
  return amount >= VALIDATION_RULES.MIN_AMOUNT && amount <= VALIDATION_RULES.MAX_AMOUNT
}