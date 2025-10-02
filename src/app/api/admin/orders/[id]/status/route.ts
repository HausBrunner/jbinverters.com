import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import nodemailer from 'nodemailer'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status, sendEmail } = await request.json()
    const { id } = await params

    // Update order status
    const order = await prisma.order.update({
      where: {
        id,
      },
      data: {
        status,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Send email notification if requested and customer email exists
    if (sendEmail && order.customerEmail) {
      try {
        await sendStatusUpdateEmail(order)
      } catch (emailError) {
        console.error('Failed to send email:', emailError)
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

async function sendStatusUpdateEmail(order: any) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  })

  const statusMessages = {
    PENDING: {
      subject: 'Order Received - JB Inverters',
      message: `Thank you for your order! Your order #${order.orderNumber} has been received and is pending payment confirmation.`
    },
    PAID: {
      subject: 'Payment Confirmed - JB Inverters',
      message: `Great news! Payment for your order #${order.orderNumber} has been confirmed. We're now preparing your items for shipment.`
    },
    PROCESSING: {
      subject: 'Order Processing - JB Inverters',
      message: `Your order #${order.orderNumber} is being prepared for shipment. We'll notify you once it ships.`
    },
    SHIPPED: {
      subject: 'Order Shipped - JB Inverters',
      message: `Your order #${order.orderNumber} has been shipped! You should receive it soon.`
    },
    DELIVERED: {
      subject: 'Order Delivered - JB Inverters',
      message: `Your order #${order.orderNumber} has been delivered. Thank you for choosing JB Inverters!`
    }
  }

  const statusInfo = statusMessages[order.status as keyof typeof statusMessages]
  if (!statusInfo) return

  const itemsList = order.items.map((item: any) => 
    `- ${item.product.name} (Qty: ${item.quantity}) - $${item.price.toFixed(2)}`
  ).join('\n')

  const emailContent = `
Hello ${order.customerName || 'Valued Customer'},

${statusInfo.message}

Order Details:
Order Number: ${order.orderNumber}
Total: $${order.total.toFixed(2)}

Shipping Information:
${order.customerName || 'N/A'}
${order.customerAddress || 'No address provided'}
${order.customerPhone ? `Phone: ${order.customerPhone}` : 'No phone provided'}

Items Ordered:
${itemsList}

${order.status === 'SHIPPED' ? 'Track your package using the tracking information provided by the shipping carrier.' : ''}
${order.status === 'DELIVERED' ? 'If you have any questions about your order, please don\'t hesitate to contact us.' : ''}

Thank you for choosing JB Inverters!

Best regards,
The JB Inverters Team

---
JB Inverters
Professional Power Conversion Solutions
Contact: support@jbinverters.com
  `.trim()

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: order.customerEmail,
    subject: statusInfo.subject,
    text: emailContent,
    html: emailContent.replace(/\n/g, '<br>'),
  })
}
