'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface QRCodeGeneratorProps {
  data: string
  size?: number
  className?: string
}

export default function QRCodeGenerator({ data, size = 200, className = '' }: QRCodeGeneratorProps) {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!data) {
      setLoading(false)
      return
    }

    const generateQRCode = async () => {
      try {
        setLoading(true)
        setError('')
        
        // Generate QR code as data URL
        const qrCodeURL = await QRCode.toDataURL(data, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',  // QR code color
            light: '#FFFFFF'  // Background color
          },
          errorCorrectionLevel: 'M'
        })
        
        setQrCodeDataURL(qrCodeURL)
      } catch (err) {
        console.error('Error generating QR code:', err)
        setError('Failed to generate QR code')
      } finally {
        setLoading(false)
      }
    }

    generateQRCode()
  }, [data, size])

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ width: size, height: size }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-50 rounded-lg border border-red-200 ${className}`} style={{ width: size, height: size }}>
        <div className="text-center text-red-600">
          <p className="text-sm font-medium">Error</p>
          <p className="text-xs">{error}</p>
        </div>
      </div>
    )
  }

  if (!qrCodeDataURL) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ width: size, height: size }}>
        <div className="text-center text-gray-500">
          <p className="text-sm">No QR Code</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`inline-block ${className}`}>
      <img 
        src={qrCodeDataURL} 
        alt="QR Code for payment"
        className="rounded-lg border border-gray-200"
        style={{ width: size, height: size }}
      />
    </div>
  )
}
