import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

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
    const { trackingNumber } = await request.json()

    if (typeof trackingNumber !== 'string') {
      return NextResponse.json({ error: 'trackingNumber must be a string' }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id },
      data: { trackingNumber },
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
    console.error('Error updating tracking number:', error)
    return NextResponse.json(
      { error: 'Failed to update tracking number' },
      { status: 500 }
    )
  }
}
