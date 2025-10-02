import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// PUT /api/admin/orders/[id]/notes - Update order notes
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { notes } = await request.json()

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        internalNotes: notes || null
      }
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error updating order notes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
