import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'
import { validateAndSanitize, serialNumberSchema } from '@/lib/validation'

// GET /api/admin/serial-numbers - Get serial numbers for a product
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('productId')

  if (!productId) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
  }

  try {
    const serialNumbers = await prisma.serialNumber.findMany({
      where: { productId },
      include: {
        order: {
          select: {
            orderNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform the data to include orderNumber directly
    const transformedSerialNumbers = serialNumbers.map(serial => ({
      ...serial,
      orderNumber: serial.order?.orderNumber || null
    }))

    return NextResponse.json(transformedSerialNumbers)
  } catch (error) {
    console.error('Error fetching serial numbers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/serial-numbers - Create new serial numbers
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rawData = await request.json()
    
    // Validate productId separately as it's not part of the serial number schema
    if (!rawData.productId || typeof rawData.productId !== 'string') {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }
    
    // Validate and sanitize serial numbers input
    const validation = validateAndSanitize(serialNumberSchema, rawData)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      )
    }

    const { productId } = rawData
    const { serialNumbers, notes } = validation.data

    // Create multiple serial numbers
    const createdSerialNumbers = await Promise.all(
      serialNumbers.map((serial: string) =>
        prisma.serialNumber.create({
          data: {
            productId,
            serialNumber: serial.trim(),
            notes: notes || null,
          }
        })
      )
    )

    return NextResponse.json(createdSerialNumbers)
  } catch (error) {
    console.error('Error creating serial numbers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
