import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { validateAndSanitize, contactMessageSchema, escapeHtml } from '@/lib/validation'
import { addSecurityHeaders, checkRateLimit, verifyCSRFProtection, getClientIP, RATE_LIMITS } from '@/lib/security'
import { createCSRFErrorResponse, createRateLimitErrorResponse, createValidationErrorResponse, createInternalErrorResponse, withErrorHandling } from '@/lib/error-handler'

export const POST = withErrorHandling(async (request: NextRequest) => {
  // CSRF Protection - Temporarily disabled for testing
  // const csrfCheck = verifyCSRFProtection(request)
  // if (!csrfCheck.valid) {
  //   return createCSRFErrorResponse(csrfCheck.error)
  // }

  // Enhanced rate limiting
  const clientIP = getClientIP(request)
  const rateLimit = checkRateLimit(
    `contact:${clientIP}`, 
    RATE_LIMITS.CONTACT.maxRequests, 
    RATE_LIMITS.CONTACT.windowMs,
    RATE_LIMITS.CONTACT.blockDurationMs
  )
  
  if (!rateLimit.allowed) {
    const errorMessage = rateLimit.blocked 
      ? `Too many requests. IP blocked until ${new Date(rateLimit.resetTime).toISOString()}`
      : 'Too many requests. Please try again later.'
    
    return createRateLimitErrorResponse(errorMessage)
  }

  const rawData = await request.json()
  
  // Validate and sanitize input
  const validation = validateAndSanitize(contactMessageSchema, rawData)
  if (!validation.success) {
    return createValidationErrorResponse(validation.errors)
  }

  const { name, email, message } = validation.data

  // Send email notification (if configured)
  console.log('SMTP Config Check:', {
    host: !!process.env.SMTP_HOST,
    user: !!process.env.SMTP_USER,
    pass: !!process.env.SMTP_PASS,
    port: process.env.SMTP_PORT
  })
  
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('Attempting to send email...')
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      await transporter.sendMail({
        from: 'jbinverters@gmail.com',
        to: 'jbinverters@gmail.com',
        subject: `New Contact Form Message from ${escapeHtml(name)}`,
        html: `
          <h2>New Contact Form Message</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
          <hr>
          <p><small>This message was sent from the JB Inverters contact form.</small></p>
          <p><strong>Reply to:</strong> ${escapeHtml(email)}</p>
        `,
        replyTo: email, // This allows you to reply directly to the customer
      })
      
      console.log('Contact form email sent successfully')
    } catch (emailError) {
      console.error('Error sending contact form email:', emailError)
      // Don't fail the entire request if email fails, just log it
    }
  } else {
    console.log('SMTP not configured, skipping email notification')
  }

  const response = NextResponse.json({ success: true })
  return addSecurityHeaders(response)
})
