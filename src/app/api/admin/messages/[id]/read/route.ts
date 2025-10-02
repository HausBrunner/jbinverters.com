import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// PUT /api/admin/messages/[id]/read - Mark message as read/unread
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { isRead } = await request.json()

    const updatedMessage = await prisma.contactMessage.update({
      where: { id: params.id },
      data: { isRead }
    })

    return NextResponse.json(updatedMessage)
  } catch (error) {
    console.error('Error updating message read status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
