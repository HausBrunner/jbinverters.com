import { NextResponse } from 'next/server'
import { generateCSRFToken } from '@/lib/security'
import { addSecurityHeaders } from '@/lib/security'

export async function GET() {
  try {
    const csrfToken = generateCSRFToken()
    
    const response = NextResponse.json({ csrfToken })
    
    // Add security headers
    return addSecurityHeaders(response)
  } catch (error) {
    console.error('Error generating CSRF token:', error)
    const response = NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    )
    return addSecurityHeaders(response)
  }
}
