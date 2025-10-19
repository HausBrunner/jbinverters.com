import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateAndSanitize, orderSchema } from '@/lib/validation'
import { addSecurityHeaders, checkRateLimit, verifyCSRFProtection, getClientIP, RATE_LIMITS } from '@/lib/security'
import nodemailer from 'nodemailer'
import { emailTemplateLoader } from '@/lib/email-templates'

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/orders called')
    
    // CSRF Protection - Temporarily disabled for testing
    // const csrfCheck = verifyCSRFProtection(request)
    // if (!csrfCheck.valid) {
    //   const response = NextResponse.json(
    //     { error: 'CSRF validation failed', details: csrfCheck.error },
    //     { status: 403 }
    //   )
    //   return addSecurityHeaders(response)
    // }

    // Enhanced rate limiting
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(
      `order:${clientIP}`, 
      RATE_LIMITS.ORDER.maxRequests, 
      RATE_LIMITS.ORDER.windowMs,
      RATE_LIMITS.ORDER.blockDurationMs
    )
    
    if (!rateLimit.allowed) {
      const errorMessage = rateLimit.blocked 
        ? `Too many orders. IP blocked until ${new Date(rateLimit.resetTime).toISOString()}`
        : 'Too many orders. Please try again later.'
      
      const response = NextResponse.json(
        { error: errorMessage },
        { status: 429 }
      )
      return addSecurityHeaders(response)
    }

    const rawData = await request.json()
    
    // Validate and sanitize input
    console.log('Raw data received:', rawData)
    const validation = validateAndSanitize(orderSchema, rawData)
    console.log('Validation result:', validation)
    
    if (!validation.success) {
      console.log('Validation failed:', validation.errors)
      const response = NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      )
      return addSecurityHeaders(response)
    }

    const { customerName, customerEmail, customerAddress, customerPhone, items, total } = validation.data
    console.log('Extracted data:', { items, total })

    if (!items || !Array.isArray(items)) {
      throw new Error('Items must be an array')
    }

    // Generate order number
    const orderNumber = `JB-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Start a transaction to handle order creation and inventory updates
    const order = await prisma.$transaction(async (tx) => {
      // First, verify all products exist and have sufficient stock
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.id }
        })

        if (!product) {
          throw new Error(`Product with ID ${item.id} not found`)
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`)
        }
      }

      // Create order with items
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName: customerName || 'Guest',
          customerEmail: customerEmail || '',
          customerAddress: customerAddress || '',
          customerPhone: customerPhone || '',
          total,
          status: 'ORDER_RECEIVED',
          items: {
            create: (items || []).map((item: any) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      // Update inventory for each item
      for (const item of items || []) {
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
      }

      return newOrder
    })

    // Send order confirmation email
    if (order.customerEmail) {
      try {
        await sendOrderConfirmationEmail(order)
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError)
        // Don't fail the entire request if email fails
      }
    }

    const response = NextResponse.json(order)
    return addSecurityHeaders(response)
  } catch (error) {
    console.error('Error creating order:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    const response = NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    )
    return addSecurityHeaders(response)
  }
}

async function sendOrderConfirmationEmail(order: any) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  // Check if this order contains a mail-in repair service
  const hasRepairService = order.items.some((item: any) => item.product.id === 'mail-in-service')

  // Use the email template loader to format the email
  const emailContent = emailTemplateLoader.formatInitialConfirmationEmail(order, hasRepairService)

  await transporter.sendMail({
    from: emailContent.fromEmail,
    to: order.customerEmail,
    subject: emailContent.subject,
    html: emailContent.html,
  })
}

export async function GET() {
  // This endpoint is for admin use only - remove public access
  return NextResponse.json(
    { error: 'Not Found' },
    { status: 404 }
  )
}
