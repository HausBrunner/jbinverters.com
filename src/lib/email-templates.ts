import fs from 'fs'
import path from 'path'
import { escapeHtml } from './validation'

interface EmailTemplate {
  orderType: string
  description: string
  initialConfirmation: {
    subject: string
    content: string
    fromEmail: string
  }
  statusUpdates: {
    [key: string]: {
      subject: string
      message: string
      messageWithQuote?: string
      quoteSection?: string
    }
  }
  htmlTemplate: {
    wrapper: string
  }
}

class EmailTemplateLoader {
  private static instance: EmailTemplateLoader
  private templates: Map<string, EmailTemplate> = new Map()
  private configPath = path.join(process.cwd(), 'config', 'email-templates')

  private constructor() {}

  static getInstance(): EmailTemplateLoader {
    if (!EmailTemplateLoader.instance) {
      EmailTemplateLoader.instance = new EmailTemplateLoader()
    }
    return EmailTemplateLoader.instance
  }

  private loadTemplate(filename: string): EmailTemplate {
    try {
      const filePath = path.join(this.configPath, filename)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const template = JSON.parse(fileContent)
      return template
    } catch (error) {
      console.error(`Failed to load email template ${filename}:`, error)
      throw new Error(`Email template ${filename} not found or invalid`)
    }
  }

  private getTemplate(orderType: 'product' | 'repair'): EmailTemplate {
    const cacheKey = orderType
    if (!this.templates.has(cacheKey)) {
      const filename = orderType === 'product' ? 'product-orders.json' : 'repair-orders.json'
      const template = this.loadTemplate(filename)
      this.templates.set(cacheKey, template)
    }
    return this.templates.get(cacheKey)!
  }

  // Reload templates from disk (useful for development or when templates are updated)
  reloadTemplates(): void {
    this.templates.clear()
    console.log('Email templates cache cleared - templates will be reloaded from disk')
  }

  // Get initial confirmation email template
  getInitialConfirmationTemplate(hasRepairService: boolean): {
    subject: string
    content: string
    fromEmail: string
  } {
    const orderType = hasRepairService ? 'repair' : 'product'
    const template = this.getTemplate(orderType)
    return template.initialConfirmation
  }

  // Get status update email template
  getStatusUpdateTemplate(
    hasRepairService: boolean,
    status: string
  ): {
    subject: string
    message: string
    messageWithQuote?: string
    quoteSection?: string
  } {
    const orderType = hasRepairService ? 'repair' : 'product'
    const template = this.getTemplate(orderType)
    
    const statusTemplate = template.statusUpdates[status]
    if (!statusTemplate) {
      throw new Error(`Status template not found for ${orderType} orders: ${status}`)
    }
    
    return statusTemplate
  }

  // Get HTML wrapper template
  getHtmlTemplate(hasRepairService: boolean): string {
    const orderType = hasRepairService ? 'repair' : 'product'
    const template = this.getTemplate(orderType)
    return template.htmlTemplate.wrapper
  }

  // Format initial confirmation email
  formatInitialConfirmationEmail(
    order: any,
    hasRepairService: boolean
  ): {
    subject: string
    html: string
    fromEmail: string
  } {
    // Use ORDER_RECEIVED status template instead of initialConfirmation
    const emailContent = this.formatStatusUpdateEmail(order, hasRepairService, 'ORDER_RECEIVED')
    
    // Get fromEmail from the template
    const template = this.getInitialConfirmationTemplate(hasRepairService)

    return {
      subject: emailContent.subject,
      html: emailContent.html,
      fromEmail: template.fromEmail
    }
  }

  // Format status update email
  formatStatusUpdateEmail(
    order: any,
    hasRepairService: boolean,
    status: string
  ): {
    subject: string
    html: string
  } {
    const statusTemplate = this.getStatusUpdateTemplate(hasRepairService, status)

    // Format date
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })

    // Format items list
    const itemsList = order.items.map((item: any) => 
      `- ${item.product.name} (Qty: ${item.quantity}) - $${item.price.toFixed(2)}`
    ).join('\n')

    // Determine message content
    let message = statusTemplate.message
    let additionalContent = ''

    if (status === 'QUOTE_SENT' && order.repairQuote) {
      message = statusTemplate.messageWithQuote || statusTemplate.message
      // Don't add additional quote section since messageWithQuote already includes the quote
    }

    // Replace all placeholders in the message (including repairQuote) with HTML escaped values
    const formattedMessage = message
      .replace(/\[customerName\]/g, escapeHtml(order.customerName || 'Valued Customer'))
      .replace(/\[orderDate\]/g, escapeHtml(orderDate))
      .replace(/\[customerAddress\]/g, escapeHtml(order.customerAddress || 'No address provided'))
      .replace(/\[orderNumber\]/g, escapeHtml(order.orderNumber))
      .replace(/\[itemsList\]/g, escapeHtml(itemsList))
      .replace(/\[total\]/g, order.total.toFixed(2)) // Numbers don't need escaping
      .replace(/\[trackingNumber\]/g, escapeHtml(order.trackingNumber || 'Not yet assigned'))
      .replace(/\[repairQuote\]/g, escapeHtml(order.repairQuote || 'No quote available'))

    // Replace placeholders in the subject line (no HTML escaping needed for subject)
    const formattedSubject = statusTemplate.subject
      .replace(/\[customerName\]/g, order.customerName || 'Valued Customer')
      .replace(/\[orderDate\]/g, orderDate)
      .replace(/\[customerAddress\]/g, order.customerAddress || 'No address provided')
      .replace(/\[orderNumber\]/g, order.orderNumber)
      .replace(/\[total\]/g, order.total.toFixed(2))
      .replace(/\[trackingNumber\]/g, order.trackingNumber || 'Not yet assigned')

    // Create simple HTML from the formatted message
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="white-space: pre-line;">${formattedMessage}</div>
        ${additionalContent}
      </div>
    `

    return {
      subject: formattedSubject,
      html
    }
  }
}

// Export singleton instance
export const emailTemplateLoader = EmailTemplateLoader.getInstance()

// Export types for use in other files
export type { EmailTemplate }
