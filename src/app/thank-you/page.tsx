'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { CheckCircle, Mail, Clock } from 'lucide-react'

function ThankYouContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order')
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderNumber) {
      // Fetch order details
      fetchOrderDetails(orderNumber)
    }
  }, [orderNumber])

  const fetchOrderDetails = async (orderNum: string) => {
    try {
      const response = await fetch(`/api/orders/${orderNum}`)
      if (response.ok) {
        const order = await response.json()
        setOrderDetails(order)
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation cartCount={0} />
      
      <div className="bg-gradient-to-br from-green-900 to-green-800 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-300" />
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Thank You for Your Order!</h1>
            <p className="text-green-200">Your order has been received and is being processed</p>
          </div>
        </div>
      </div>
      
      <section className="py-16 bg-gray-50 flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Order Summary */}
          {orderDetails && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Order Number</h3>
                  <p className="text-lg font-mono font-bold text-gray-900">{orderDetails.orderNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Order Date</h3>
                  <p className="text-lg text-gray-900">{new Date(orderDetails.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name: <span className="font-medium text-gray-900">{orderDetails.customerName}</span></p>
                    <p className="text-sm text-gray-600">Email: <span className="font-medium text-gray-900">{orderDetails.customerEmail}</span></p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone: <span className="font-medium text-gray-900">{orderDetails.customerPhone || 'Not provided'}</span></p>
                    <p className="text-sm text-gray-600">Address: <span className="font-medium text-gray-900">{orderDetails.customerAddress || 'Not provided'}</span></p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Items Ordered</h3>
                <div className="space-y-2">
                  {orderDetails.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">{item.product.name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>${orderDetails.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <Clock className="w-6 h-6 text-blue-600 mt-1 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Payment Processing</h3>
                <p className="text-blue-800 mb-2">Your payment is being processed. This usually takes a few minutes.</p>
                <p className="text-sm text-blue-700">Once your payment is confirmed, you'll receive an email with your order status and tracking information.</p>
              </div>
            </div>
          </div>

          {/* Email Confirmation */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <Mail className="w-6 h-6 text-green-600 mt-1 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">Email Confirmation</h3>
                <p className="text-green-800 mb-2">We'll send you an email confirmation once your payment is verified.</p>
                <p className="text-sm text-green-700">Please check your email (including spam folder) for order updates and tracking information.</p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">1</div>
                <p className="text-gray-700">We'll process your payment and verify your order</p>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">2</div>
                <p className="text-gray-700">You'll receive an email confirmation with order details</p>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">3</div>
                <p className="text-gray-700">We'll prepare and ship your order as soon as possible</p>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">4</div>
                <p className="text-gray-700">You'll get tracking information when your order ships</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">Questions about your order?</p>
            <a 
              href="/contact" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ThankYouContent />
    </Suspense>
  )
}
