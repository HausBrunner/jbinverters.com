import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import nodemailer from 'nodemailer'
import { emailTemplateLoader } from '@/lib/email-templates'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { status, sendEmail } = await request.json()

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    // Valid status values
    const validStatuses = [
      'ORDER_RECEIVED',
      'PAID_PENDING_SHIPMENT', 
      'PAID',
      'CANCELLED',
      'RECEIVED',
      'QUOTE_SENT',
      'REPAIRING',
      'SHIPPED_AND_COMPLETE'
    ]

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Update the order status
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        serialNumbers: {
          include: {
            product: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    // Send email notification if requested and customer email exists
    if (sendEmail && order.customerEmail) {
      try {
        await sendStatusUpdateEmail(order, status)
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError)
        // Don't fail the entire request if email fails
      }
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    )
  }
}

async function sendStatusUpdateEmail(order: any, newStatus: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  // Check if this order contains a mail-in repair service
  const hasRepairService = order.items?.some((item: any) => item.product.id === 'mail-in-service') || false

  // Use the email template loader to format the email
  const emailContent = emailTemplateLoader.formatStatusUpdateEmail(order, hasRepairService, newStatus)

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@jbinverters.com',
    to: order.customerEmail,
    subject: emailContent.subject,
    html: emailContent.html
  }

  await transporter.sendMail(mailOptions)
}