import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'

// PUT /api/admin/serial-numbers/[id] - Update serial number
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { status, notes } = await request.json()

    const updatedSerialNumber = await prisma.serialNumber.update({
      where: { id },
      data: {
        status: status || undefined,
        notes: notes || undefined,
      }
    })

    return NextResponse.json(updatedSerialNumber)
  } catch (error) {
    console.error('Error updating serial number:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/serial-numbers/[id] - Delete serial number
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.serialNumber.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting serial number:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
