import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// PUT /api/admin/orders/[id]/archive - Archive/unarchive order
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { isArchived } = await request.json()

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        isArchived: isArchived
      }
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error updating order archive status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
