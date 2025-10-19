import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { emailTemplateLoader } from '@/lib/email-templates'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { templateType, status, orderData } = await request.json()

    if (!templateType || !status || !orderData) {
      return NextResponse.json(
        { error: 'Template type, status, and order data are required' },
        { status: 400 }
      )
    }

    if (!['product', 'repair'].includes(templateType)) {
      return NextResponse.json(
        { error: 'Invalid template type. Must be "product" or "repair"' },
        { status: 400 }
      )
    }

    // Determine if this is a repair service order
    const hasRepairService = templateType === 'repair'

    let previewContent: { subject: string; html: string }

    if (status === 'initial') {
      // Preview initial confirmation email
      const emailContent = emailTemplateLoader.formatInitialConfirmationEmail(orderData, hasRepairService)
      previewContent = {
        subject: emailContent.subject,
        html: emailContent.html.replace(/\n/g, '<br>')
      }
    } else {
      // Preview status update email
      previewContent = emailTemplateLoader.formatStatusUpdateEmail(orderData, hasRepairService, status)
    }

    return NextResponse.json(previewContent)
  } catch (error) {
    console.error('Error generating email preview:', error)
    return NextResponse.json(
      { error: 'Failed to generate email preview' },
      { status: 500 }
    )
  }
}
