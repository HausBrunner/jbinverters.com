import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { validateAndSanitize, sanitizeInput } from '@/lib/validation'
import nodemailer from 'nodemailer'

// POST /api/admin/messages/[id]/reply - Reply to a message
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rawData = await request.json()
    
    // Validate reply message
    if (!rawData.replyMessage || typeof rawData.replyMessage !== 'string') {
      return NextResponse.json({ error: 'Reply message is required' }, { status: 400 })
    }
    
    // Sanitize the reply message
    const replyMessage = sanitizeInput(rawData.replyMessage)
    
    if (replyMessage.length > 2000) {
      return NextResponse.json({ error: 'Reply message too long' }, { status: 400 })
    }

    // Get the original message
    const originalMessage = await prisma.contactMessage.findUnique({
      where: { id: params.id }
    })

    if (!originalMessage) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Mark the original message as read since we're replying
    await prisma.contactMessage.update({
      where: { id: params.id },
      data: { isRead: true }
    })

    // Send email reply to customer
    let emailSent = false
    let emailError = null

    try {
      // Check if SMTP is configured
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        const transporter = nodemailer.createTransporter({
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
          to: originalMessage.email,
          subject: `Re: Your message to JB Inverters`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1f2937;">Reply from JB Inverters</h2>
              <p>Hello ${originalMessage.name},</p>
              <p>Thank you for contacting us. Here is our reply to your message:</p>
              
              <div style="background-color: #f9fafb; padding: 20px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                <p style="margin: 0; white-space: pre-wrap;">${replyMessage.replace(/\n/g, '<br>')}</p>
              </div>
              
              <p>If you have any further questions, please don't hesitate to contact us.</p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <div style="color: #6b7280; font-size: 14px;">
                <p><strong>Your original message:</strong></p>
                <p style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 10px 0;">
                  ${originalMessage.message.replace(/\n/g, '<br>')}
                </p>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
                <p>Best regards,<br>JB Inverters Team</p>
                <p>This is an automated reply to your contact form submission.</p>
              </div>
            </div>
          `,
        })
        
        emailSent = true
        console.log(`Email reply sent successfully to ${originalMessage.email}`)
      } else {
        console.warn('SMTP not configured - email reply not sent')
        emailError = 'SMTP not configured'
      }
    } catch (error) {
      console.error('Error sending email reply:', error)
      emailError = error instanceof Error ? error.message : 'Unknown error'
    }

    return NextResponse.json({ 
      success: true, 
      message: emailSent 
        ? 'Reply sent successfully via email!' 
        : emailError 
          ? `Reply saved but email failed: ${emailError}` 
          : 'Reply saved but email not configured'
    })
  } catch (error) {
    console.error('Error sending reply:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
