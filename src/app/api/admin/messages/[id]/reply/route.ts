import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { validateAndSanitize, sanitizeInput } from '@/lib/validation'

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

    // TODO: Send email reply to customer
    // For now, we'll just log the reply
    console.log(`Reply to ${originalMessage.email}:`, replyMessage)

    return NextResponse.json({ 
      success: true, 
      message: 'Reply sent successfully (email functionality to be implemented)'
    })
  } catch (error) {
    console.error('Error sending reply:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
