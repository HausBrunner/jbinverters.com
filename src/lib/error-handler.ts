import { NextResponse } from 'next/server'
import { addSecurityHeaders } from './security'

// Error types for better categorization
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  CSRF_ERROR = 'CSRF_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR'
}

// Safe error messages that don't leak sensitive information
const SAFE_ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.VALIDATION_ERROR]: 'Invalid input provided',
  [ErrorType.AUTHENTICATION_ERROR]: 'Authentication required',
  [ErrorType.AUTHORIZATION_ERROR]: 'Access denied',
  [ErrorType.NOT_FOUND_ERROR]: 'Resource not found',
  [ErrorType.RATE_LIMIT_ERROR]: 'Too many requests',
  [ErrorType.CSRF_ERROR]: 'Security validation failed',
  [ErrorType.INTERNAL_ERROR]: 'An internal error occurred',
  [ErrorType.EXTERNAL_SERVICE_ERROR]: 'External service unavailable'
}

// HTTP status codes for each error type
const ERROR_STATUS_CODES: Record<ErrorType, number> = {
  [ErrorType.VALIDATION_ERROR]: 400,
  [ErrorType.AUTHENTICATION_ERROR]: 401,
  [ErrorType.AUTHORIZATION_ERROR]: 403,
  [ErrorType.NOT_FOUND_ERROR]: 404,
  [ErrorType.RATE_LIMIT_ERROR]: 429,
  [ErrorType.CSRF_ERROR]: 403,
  [ErrorType.INTERNAL_ERROR]: 500,
  [ErrorType.EXTERNAL_SERVICE_ERROR]: 503
}

interface ErrorDetails {
  type: ErrorType
  message?: string
  details?: any
  originalError?: Error
}

export function createErrorResponse(errorDetails: ErrorDetails): NextResponse {
  const { type, message, details, originalError } = errorDetails
  
  // Log the original error for debugging (server-side only)
  if (originalError && process.env.NODE_ENV === 'development') {
    console.error('Original error:', originalError)
  } else if (originalError) {
    // In production, log minimal info
    console.error(`Error type ${type}: ${originalError.name}`)
  }
  
  // Use safe error message
  const safeMessage = message || SAFE_ERROR_MESSAGES[type]
  const statusCode = ERROR_STATUS_CODES[type]
  
  // Only include details in development
  const responseData: any = { error: safeMessage }
  if (process.env.NODE_ENV === 'development' && details) {
    responseData.details = details
  }
  
  const response = NextResponse.json(responseData, { status: statusCode })
  return addSecurityHeaders(response)
}

// Convenience functions for common error types
export function createValidationErrorResponse(details?: any, originalError?: Error): NextResponse {
  return createErrorResponse({
    type: ErrorType.VALIDATION_ERROR,
    details,
    originalError
  })
}

export function createAuthenticationErrorResponse(message?: string, originalError?: Error): NextResponse {
  return createErrorResponse({
    type: ErrorType.AUTHENTICATION_ERROR,
    message,
    originalError
  })
}

export function createAuthorizationErrorResponse(message?: string, originalError?: Error): NextResponse {
  return createErrorResponse({
    type: ErrorType.AUTHORIZATION_ERROR,
    message,
    originalError
  })
}

export function createNotFoundErrorResponse(message?: string, originalError?: Error): NextResponse {
  return createErrorResponse({
    type: ErrorType.NOT_FOUND_ERROR,
    message,
    originalError
  })
}

export function createRateLimitErrorResponse(message?: string, originalError?: Error): NextResponse {
  return createErrorResponse({
    type: ErrorType.RATE_LIMIT_ERROR,
    message,
    originalError
  })
}

export function createCSRFErrorResponse(message?: string, originalError?: Error): NextResponse {
  return createErrorResponse({
    type: ErrorType.CSRF_ERROR,
    message,
    originalError
  })
}

export function createInternalErrorResponse(message?: string, originalError?: Error): NextResponse {
  return createErrorResponse({
    type: ErrorType.INTERNAL_ERROR,
    message,
    originalError
  })
}

export function createExternalServiceErrorResponse(message?: string, originalError?: Error): NextResponse {
  return createErrorResponse({
    type: ErrorType.EXTERNAL_SERVICE_ERROR,
    message,
    originalError
  })
}

// Wrapper for async API route handlers to catch and handle errors
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      console.error('Unhandled error in API route:', error)
      
      // Determine error type based on error instance
      if (error instanceof Error) {
        if (error.message.includes('validation') || error.message.includes('invalid')) {
          return createValidationErrorResponse(undefined, error)
        }
        if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
          return createAuthenticationErrorResponse(undefined, error)
        }
        if (error.message.includes('forbidden') || error.message.includes('authorization')) {
          return createAuthorizationErrorResponse(undefined, error)
        }
        if (error.message.includes('not found')) {
          return createNotFoundErrorResponse(undefined, error)
        }
        if (error.message.includes('rate limit') || error.message.includes('too many')) {
          return createRateLimitErrorResponse(undefined, error)
        }
        if (error.message.includes('csrf') || error.message.includes('security')) {
          return createCSRFErrorResponse(undefined, error)
        }
        if (error.message.includes('external') || error.message.includes('service')) {
          return createExternalServiceErrorResponse(undefined, error)
        }
      }
      
      // Default to internal error
      return createInternalErrorResponse(undefined, error as Error)
    }
  }
}
