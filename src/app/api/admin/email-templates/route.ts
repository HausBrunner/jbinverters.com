import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

const TEMPLATES_PATH = path.join(process.cwd(), 'config', 'email-templates')

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Read both template files
    const productTemplates = JSON.parse(
      fs.readFileSync(path.join(TEMPLATES_PATH, 'product-orders.json'), 'utf-8')
    )
    
    const repairTemplates = JSON.parse(
      fs.readFileSync(path.join(TEMPLATES_PATH, 'repair-orders.json'), 'utf-8')
    )

    return NextResponse.json({
      product: productTemplates,
      repair: repairTemplates
    })
  } catch (error) {
    console.error('Error reading email templates:', error)
    return NextResponse.json(
      { error: 'Failed to read email templates' },
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

    const { templateType, templates } = await request.json()

    if (!templateType || !templates) {
      return NextResponse.json(
        { error: 'Template type and templates data are required' },
        { status: 400 }
      )
    }

    if (!['product', 'repair'].includes(templateType)) {
      return NextResponse.json(
        { error: 'Invalid template type. Must be "product" or "repair"' },
        { status: 400 }
      )
    }

    // Validate JSON structure
    try {
      JSON.stringify(templates) // Test if it's valid JSON
    } catch (jsonError) {
      return NextResponse.json(
        { error: 'Invalid JSON structure' },
        { status: 400 }
      )
    }

    // Determine filename
    const filename = templateType === 'product' ? 'product-orders.json' : 'repair-orders.json'
    const filePath = path.join(TEMPLATES_PATH, filename)

    // Write to file
    fs.writeFileSync(filePath, JSON.stringify(templates, null, 2), 'utf-8')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating email templates:', error)
    return NextResponse.json(
      { error: 'Failed to update email templates' },
      { status: 500 }
    )
  }
}
