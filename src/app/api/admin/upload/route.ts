import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { randomBytes } from 'crypto'

// Configure route for larger uploads
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Increase the max body size for this route
export const maxDuration = 30

// Allowed file extensions and their corresponding MIME types
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/webp',
  'image/gif'
]

// File signature magic numbers for validation
const FILE_SIGNATURES: { [key: string]: number[][] } = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46], [0x57, 0x45, 0x42, 0x50]], // RIFF...WEBP
  'image/gif': [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]] // GIF87a or GIF89a
}

// Validate file extension
function validateFileExtension(filename: string): boolean {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return ALLOWED_EXTENSIONS.includes(ext)
}

// Validate file signature/magic number
function validateFileSignature(buffer: Buffer, mimeType: string): boolean {
  const signatures = FILE_SIGNATURES[mimeType]
  if (!signatures) return false
  
  return signatures.some(signature => {
    if (buffer.length < signature.length) return false
    return signature.every((byte, index) => buffer[index] === byte)
  })
}

// Generate secure random filename
function generateSecureFilename(originalName: string): string {
  const ext = originalName.toLowerCase().substring(originalName.lastIndexOf('.'))
  const randomString = randomBytes(16).toString('hex')
  return `product-${randomString}${ext}`
}

export async function POST(request: NextRequest) {
  try {
    console.log('Upload request received')
    const session = await getServerSession(authOptions)
    
    if (!session) {
      console.log('Upload failed: No session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      console.log('Upload failed: No file')
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    console.log('File received:', file.name, file.size, file.type)

    // Validate file extension
    if (!validateFileExtension(file.name)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPG, PNG, WebP, and GIF files are allowed.' 
      }, { status: 400 })
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only image files are allowed.' 
      }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    // Additional size check (min 1 byte)
    if (file.size < 1) {
      return NextResponse.json({ error: 'File appears to be empty' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Validate file signature/magic number
    if (!validateFileSignature(buffer, file.type)) {
      return NextResponse.json({ 
        error: 'File signature does not match declared file type. File may be corrupted or malicious.' 
      }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate secure random filename
    const filename = generateSecureFilename(file.name)
    const filepath = join(uploadsDir, filename)

    // Write file to disk
    console.log('Writing file to:', filepath)
    await writeFile(filepath, buffer)
    console.log('File written successfully')

    // Return the public URL
    const imageUrl = `/uploads/${filename}`

    console.log('Upload successful:', imageUrl)
    return NextResponse.json({ 
      success: true, 
      imageUrl,
      filename 
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}` }, 
      { status: 500 }
    )
  }
}
