import { NextRequest, NextResponse } from 'next/server'
import { randomBytes, createHmac, timingSafeEqual } from 'crypto'

// Security headers for API responses
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent XSS attacks
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Prevent MIME type sniffing
  response.headers.set('Content-Security-Policy', "default-src 'self'")
  
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return response
}

// CSRF Protection
const CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production'

export function generateCSRFToken(): string {
  const token = randomBytes(32).toString('hex')
  const timestamp = Date.now().toString()
  const signature = createHmac('sha256', CSRF_SECRET)
    .update(token + timestamp)
    .digest('hex')
  
  return `${token}:${timestamp}:${signature}`
}

export function validateCSRFToken(token: string): boolean {
  try {
    const parts = token.split(':')
    if (parts.length !== 3) return false
    
    const [tokenPart, timestamp, signature] = parts
    
    // Check if token is not too old (5 minutes)
    const tokenAge = Date.now() - parseInt(timestamp)
    if (tokenAge > 5 * 60 * 1000) return false
    
    // Verify signature
    const expectedSignature = createHmac('sha256', CSRF_SECRET)
      .update(tokenPart + timestamp)
      .digest('hex')
    
    return timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  } catch {
    return false
  }
}

export function verifyCSRFProtection(request: NextRequest): { valid: boolean; error?: string } {
  const method = request.method
  
  // Only protect state-changing methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return { valid: true }
  }
  
  // Skip CSRF for API routes that use session-based auth (next-auth handles this)
  const url = request.nextUrl.pathname
  if (url.startsWith('/api/auth/') || url.startsWith('/api/admin/')) {
    return { valid: true }
  }
  
  // Check for CSRF token in headers or body
  const csrfToken = request.headers.get('x-csrf-token') || 
                   request.headers.get('csrf-token')
  
  if (!csrfToken) {
    return { valid: false, error: 'CSRF token missing' }
  }
  
  if (!validateCSRFToken(csrfToken)) {
    return { valid: false, error: 'Invalid CSRF token' }
  }
  
  return { valid: true }
}

// Enhanced rate limiting with multiple tiers and cleanup
interface RateLimitEntry {
  count: number
  resetTime: number
  blocked: boolean
  blockUntil?: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime && (!entry.blockUntil || now > entry.blockUntil)) {
      rateLimitMap.delete(key)
    }
  }
}, 5 * 60 * 1000)

export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000, // 1 minute
  blockDurationMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetTime: number; blocked: boolean } {
  const now = Date.now()
  const key = identifier
  const current = rateLimitMap.get(key)

  // Check if currently blocked
  if (current?.blocked && current.blockUntil && now < current.blockUntil) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.blockUntil,
      blocked: true
    }
  }

  // Reset block status if block period has expired
  if (current?.blocked && current.blockUntil && now >= current.blockUntil) {
    current.blocked = false
    current.blockUntil = undefined
  }

  if (!current || now > current.resetTime) {
    // Reset or create new entry
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs,
      blocked: false
    })
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
      blocked: false
    }
  }

  if (current.count >= maxRequests) {
    // Block the identifier
    current.blocked = true
    current.blockUntil = now + blockDurationMs
    rateLimitMap.set(key, current)
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.blockUntil,
      blocked: true
    }
  }

  // Increment count
  current.count++
  rateLimitMap.set(key, current)

  return {
    allowed: true,
    remaining: maxRequests - current.count,
    resetTime: current.resetTime,
    blocked: false
  }
}

// Rate limiting configurations for different endpoints
export const RATE_LIMITS = {
  CONTACT: { maxRequests: 5, windowMs: 60000, blockDurationMs: 15 * 60 * 1000 }, // 5 per minute, 15min block
  ORDER: { maxRequests: 3, windowMs: 60000, blockDurationMs: 30 * 60 * 1000 }, // 3 per minute, 30min block
  LOGIN: { maxRequests: 5, windowMs: 15 * 60000, blockDurationMs: 60 * 60 * 1000 }, // 5 per 15min, 1hr block
  UPLOAD: { maxRequests: 10, windowMs: 60000, blockDurationMs: 10 * 60 * 1000 }, // 10 per minute, 10min block
  API_GENERAL: { maxRequests: 100, windowMs: 60000, blockDurationMs: 5 * 60 * 1000 }, // 100 per minute, 5min block
} as const

// Get client IP with proper header checking
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (cfConnectingIP) return cfConnectingIP
  if (realIP) return realIP
  if (forwarded) return forwarded.split(',')[0].trim()
  
  return 'unknown'
}

// Input length limits
export const INPUT_LIMITS = {
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  MESSAGE_MAX_LENGTH: 2000,
  PRODUCT_NAME_MAX_LENGTH: 255,
  PRODUCT_DESCRIPTION_MAX_LENGTH: 1000,
  SERIAL_NUMBER_MAX_LENGTH: 100,
  NOTES_MAX_LENGTH: 500,
  ADDRESS_MAX_LENGTH: 1000,
  PHONE_MAX_LENGTH: 50
} as const

// Validate input length
export function validateInputLength(
  input: string, 
  maxLength: number, 
  fieldName: string
): { valid: boolean; error?: string } {
  if (input.length > maxLength) {
    return {
      valid: false,
      error: `${fieldName} must be less than ${maxLength} characters`
    }
  }
  return { valid: true }
}
