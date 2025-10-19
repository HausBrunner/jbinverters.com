import { z } from 'zod'

// HTML escaping function to prevent XSS in email templates
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F;')
}

// Enhanced input sanitization with security checks
export function sanitizeInput(input: any): any {
  if (input === null || input === undefined) {
    return input
  }
  
  if (typeof input === 'string') {
    // Remove null bytes and control characters
    let sanitized = input
      .replace(/\0/g, '') // Remove null bytes
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .trim()
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload=/gi,
      /onerror=/gi,
      /onclick=/gi,
      /onmouseover=/gi,
      /data:text\/html/gi,
      /expression\s*\(/gi
    ]
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(sanitized)) {
        throw new Error('Potentially malicious input detected')
      }
    }
    
    return sanitized
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      // Validate object keys
      if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
        throw new Error('Invalid object key detected')
      }
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  
  return input
}


// Enhanced validation schemas with security checks
export const contactMessageSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name contains invalid characters')
    .refine((val) => !/<script|javascript:|vbscript:/i.test(val), 'Name contains potentially malicious content'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .refine((val) => !/<script|javascript:|vbscript:/i.test(val), 'Email contains potentially malicious content'),
  message: z.string()
    .min(1, 'Message is required')
    .max(2000, 'Message must be less than 2000 characters')
    .refine((val) => !/<script|javascript:|vbscript:|onload=|onerror=/i.test(val), 'Message contains potentially malicious content')
})

export const productSchema = z.object({
  name: z.string()
    .min(1, 'Product name is required')
    .max(255, 'Product name must be less than 255 characters')
    .refine((val) => !/<script|javascript:|vbscript:/i.test(val), 'Product name contains potentially malicious content'),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .refine((val) => !val || !/<script|javascript:|vbscript:/i.test(val), 'Description contains potentially malicious content')
    .optional(),
  price: z.number()
    .positive('Price must be positive')
    .max(999999.99, 'Price too high')
    .refine((val) => !isNaN(val) && isFinite(val), 'Price must be a valid number'),
  imageUrl: z.string()
    .max(500, 'Image URL too long')
    .optional()
    .refine((val) => {
      if (!val) return true // Optional field
      // Allow relative paths starting with / or valid URLs
      const isValidPath = val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://')
      const noScripts = !/<script|javascript:|vbscript:/i.test(val)
      return isValidPath && noScripts
    }, 'Image URL must be a valid path or URL without malicious content'),
  stock: z.number()
    .int('Stock must be an integer')
    .min(0, 'Stock cannot be negative')
    .max(99999, 'Stock too high')
    .refine((val) => !isNaN(val) && isFinite(val), 'Stock must be a valid number'),
  displayOrder: z.number()
    .int('Display order must be an integer')
    .min(0, 'Display order cannot be negative')
    .max(9999, 'Display order too high')
    .refine((val) => !isNaN(val) && isFinite(val), 'Display order must be a valid number')
    .default(0),
  isActive: z.boolean().default(true)
})

export const orderItemSchema = z.object({
  id: z.string().min(1, 'Product ID is required'),
  quantity: z.number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(999, 'Quantity too high'),
  price: z.number()
    .positive('Price must be positive')
    .max(999999.99, 'Price too high')
})

export const orderSchema = z.object({
  customerName: z.string()
    .max(255, 'Customer name too long')
    .optional(),
  customerEmail: z.string()
    .email('Invalid email format')
    .max(255, 'Email too long')
    .optional(),
  customerAddress: z.string()
    .max(1000, 'Address too long')
    .optional(),
  customerPhone: z.string()
    .max(50, 'Phone number too long')
    .optional(),
  items: z.array(orderItemSchema)
    .min(1, 'At least one item is required')
    .max(50, 'Too many items'),
  total: z.number()
    .positive('Total must be positive')
    .max(999999.99, 'Total too high')
})

export const serialNumberSchema = z.object({
  serialNumbers: z.array(z.string())
    .min(1, 'Serial numbers are required')
    .max(100, 'Too many serial numbers'),
  notes: z.string()
    .max(500, 'Notes too long')
    .optional()
})

// Enhanced validation helper function with security checks
export function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: any): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    // First sanitize the input (this may throw for malicious content)
    const sanitizedData = sanitizeInput(data)
    
    // Then validate with schema
    const result = schema.parse(sanitizedData)
    
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: (error.issues || []).map((err: any) => `${err.path.join('.')}: ${err.message}`)
      }
    }
    
    // Handle sanitization errors (malicious input detected)
    if (error instanceof Error && error.message.includes('malicious')) {
      return { 
        success: false, 
        errors: ['Potentially malicious input detected'] 
      }
    }
    
    console.error('Validation error:', error)
    return { success: false, errors: ['Invalid input format'] }
  }
}
