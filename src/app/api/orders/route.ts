import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateAndSanitize, orderSchema } from '@/lib/validation'
import { addSecurityHeaders, checkRateLimit } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/orders called')
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    
    const rateLimit = checkRateLimit(`order:${clientIP}`, 3, 60000) // 3 orders per minute
    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
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
          status: 'PENDING',
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

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
