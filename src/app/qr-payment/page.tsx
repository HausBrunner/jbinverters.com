'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import QRCodeGenerator from '@/components/QRCodeGenerator'

function QRPaymentContent() {
  const searchParams = useSearchParams()
  const venmoData = searchParams.get('data')
  const orderNumber = searchParams.get('order')
  const amount = searchParams.get('amount')

  if (!venmoData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid QR Code</h1>
          <p className="text-gray-600">No payment data provided.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Scan to Pay</h1>
          <p className="text-gray-600 mb-6">Use your phone's camera or Venmo app to scan this QR code</p>
          
          <div className="mb-6">
            <QRCodeGenerator 
              data={venmoData} 
              size={300}
              className="mx-auto"
            />
          </div>
          
          {orderNumber && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Order:</span> {orderNumber}
              </p>
              {amount && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Amount:</span> ${amount}
                </p>
              )}
            </div>
          )}
          
          <div className="text-sm text-gray-500 space-y-2">
            <p>1. Open your Venmo app</p>
            <p>2. Tap "Scan Code" or use your camera</p>
            <p>3. Scan this QR code</p>
            <p>4. Complete the payment</p>
          </div>
          
          <button
            onClick={() => window.close()}
            className="mt-6 w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  )
}

export default function QRPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    }>
      <QRPaymentContent />
    </Suspense>
  )
}
