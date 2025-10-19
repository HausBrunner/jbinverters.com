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
    console.log('Received data:', rawData)
    
    // Validate productId separately as it's not part of the serial number schema
    if (!rawData.productId || typeof rawData.productId !== 'string') {
      console.log('Invalid product ID:', rawData.productId)
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }
    
    // Extract serial numbers and notes from the request
    const { serialNumbers, notes } = rawData
    const productId = rawData.productId
    
    // Validate serial numbers array
    if (!Array.isArray(serialNumbers) || serialNumbers.length === 0) {
      console.log('Invalid serial numbers array:', serialNumbers)
      return NextResponse.json(
        { error: 'Serial numbers must be a non-empty array' },
        { status: 400 }
      )
    }
    
    // Validate each serial number
    const invalidSerials = serialNumbers.filter(serial => 
      typeof serial !== 'string' || serial.trim().length === 0
    )
    
    if (invalidSerials.length > 0) {
      console.log('Invalid serial number entries:', invalidSerials)
      return NextResponse.json(
        { error: 'All serial numbers must be non-empty strings' },
        { status: 400 }
      )
    }

    // Check for existing serial numbers to avoid duplicates
    const trimmedSerials = serialNumbers.map((serial: string) => serial.trim())
    const existingSerials = await prisma.serialNumber.findMany({
      where: {
        serialNumber: {
          in: trimmedSerials
        }
      },
      select: {
        serialNumber: true
      }
    })

    if (existingSerials.length > 0) {
      const duplicateSerials = existingSerials.map(s => s.serialNumber)
      return NextResponse.json(
        { 
          error: 'Duplicate serial numbers found', 
          details: `The following serial numbers already exist: ${duplicateSerials.join(', ')}` 
        }, 
        { status: 400 }
      )
    }

    // Create multiple serial numbers
    const createdSerialNumbers = await Promise.all(
      trimmedSerials.map((serial: string) =>
        prisma.serialNumber.create({
          data: {
            productId,
            serialNumber: serial,
            notes: notes || null,
          }
        })
      )
    )

    return NextResponse.json(createdSerialNumbers)
  } catch (error) {
    console.error('Error creating serial numbers:', error)
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint failed')) {
        return NextResponse.json(
          { error: 'Duplicate serial number detected. Please check for duplicates and try again.' }, 
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
