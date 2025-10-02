import { z } from 'zod'

// Input sanitization function
export function sanitizeInput(input: any): any {
  if (input === null || input === undefined) {
    return input
  }
  
  if (typeof input === 'string') {
    // Remove potential SQL injection patterns
    return input
      .replace(/['"`;\\]/g, '') // Remove quotes and semicolons
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*/g, '') // Remove block comment starts
      .replace(/\*\//g, '') // Remove block comment ends
      .replace(/xp_/gi, '') // Remove extended stored procedures
      .replace(/sp_/gi, '') // Remove system stored procedures
      .trim()
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  
  return input
}

// Validation schemas
export const contactMessageSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name contains invalid characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  message: z.string()
    .min(1, 'Message is required')
    .max(2000, 'Message must be less than 2000 characters')
})

export const productSchema = z.object({
  name: z.string()
    .min(1, 'Product name is required')
    .max(255, 'Product name must be less than 255 characters'),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  price: z.number()
    .positive('Price must be positive')
    .max(999999.99, 'Price too high'),
  imageUrl: z.string()
    .url('Invalid image URL')
    .max(500, 'Image URL too long')
    .optional(),
  stock: z.number()
    .int('Stock must be an integer')
    .min(0, 'Stock cannot be negative')
    .max(99999, 'Stock too high'),
  displayOrder: z.number()
    .int('Display order must be an integer')
    .min(0, 'Display order cannot be negative')
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

// Validation helper function
export function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: any): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    // First sanitize the input
    const sanitizedData = sanitizeInput(data)
    
    // Then validate with schema
    const result = schema.parse(sanitizedData)
    
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: (error.errors || []).map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }
    console.error('Validation error:', error)
    return { success: false, errors: ['Invalid input format'] }
  }
}
