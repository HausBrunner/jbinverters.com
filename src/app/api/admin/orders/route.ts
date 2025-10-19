import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const archived = searchParams.get('archived') === 'true'

    // Build where clause
    const where: any = {
      isArchived: archived
    }

    // Add search filter
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Add status filter
    if (status && status !== 'ALL') {
      where.status = status
    }

    // Build orderBy clause
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    const orders = await prisma.order.findMany({
      where,
      orderBy,
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

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, ...updateData } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}
