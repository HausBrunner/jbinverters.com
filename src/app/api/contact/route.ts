import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import nodemailer from 'nodemailer'
import { validateAndSanitize, contactMessageSchema } from '@/lib/validation'
import { addSecurityHeaders, checkRateLimit } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    
    const rateLimit = checkRateLimit(`contact:${clientIP}`, 5, 60000) // 5 requests per minute
    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
      return addSecurityHeaders(response)
    }

    const rawData = await request.json()
    
    // Validate and sanitize input
    const validation = validateAndSanitize(contactMessageSchema, rawData)
    if (!validation.success) {
      const response = NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      )
      return addSecurityHeaders(response)
    }

    const { name, email, message } = validation.data

    // Save message to database
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        message,
      },
    })

    // Send email notification (if configured)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.ADMIN_EMAIL || 'admin@jbinverters.com',
        subject: `New Contact Form Message from ${name}`,
        html: `
          <h2>New Contact Form Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><small>This message was sent from the JB Inverters contact form.</small></p>
        `,
      })
    }

    const response = NextResponse.json({ success: true, id: contactMessage.id })
    return addSecurityHeaders(response)
  } catch (error) {
    console.error('Error processing contact form:', error)
    const response = NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
    return addSecurityHeaders(response)
  }
}
