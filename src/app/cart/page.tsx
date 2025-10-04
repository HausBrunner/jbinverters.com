'use client'

import { useState } from 'react'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { useCart } from '@/contexts/CartContext'
import { Minus, Plus, Trash2, CreditCard, QrCode } from 'lucide-react'
import QRCodeGenerator from '@/components/QRCodeGenerator'
import Captcha from '@/components/Captcha'

export default function CartPage() {
  const { state, updateQuantity, removeItem, clearCart, getTotalPrice } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})
  const [showQRCode, setShowQRCode] = useState(false)
  const [venmoQRData, setVenmoQRData] = useState('')
  const [orderCreated, setOrderCreated] = useState(false)
  const [createdOrder, setCreatedOrder] = useState<any>(null)
  const [captchaVerified, setCaptchaVerified] = useState(false)

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
    } else {
      updateQuantity(id, newQuantity)
    }
  }

  const handleCaptchaVerify = (isValid: boolean) => {
    setCaptchaVerified(isValid)
    // Clear captcha error when verified
    if (isValid && formErrors.captcha) {
      setFormErrors(prev => ({ ...prev, captcha: '' }))
    }
  }


  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!customerName.trim()) {
      errors.customerName = 'Name is required'
    }
    
    if (!customerEmail.trim()) {
      errors.customerEmail = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      errors.customerEmail = 'Please enter a valid email address'
    }
    
    if (!customerAddress.trim()) {
      errors.customerAddress = 'Address is required'
    }
    
    if (!customerPhone.trim()) {
      errors.customerPhone = 'Phone number is required'
    } else if (!/^[\d\s\-\+\(\)]+$/.test(customerPhone)) {
      errors.customerPhone = 'Please enter a valid phone number'
    }
    
    if (!captchaVerified) {
      errors.captcha = 'Please complete the security verification'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateOrder = async () => {
    if (!state.items || state.items.length === 0) {
      alert('Your cart is empty')
      return
    }
    
    // Validate form before proceeding
    if (!validateForm()) {
      return
    }
    
    setIsCheckingOut(true)

    try {
      // Transform cart items to match API schema
      const transformedItems = (state.items || []).map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price
      }))
      
      const orderData = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerAddress: customerAddress.trim(),
        customerPhone: customerPhone.trim(),
        items: transformedItems,
        total: getTotalPrice(),
      }
      
      // Create order in database
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => ({}))
        throw new Error(errorData?.error || 'Failed to create order')
      }

      const order = await orderResponse.json()
      setCreatedOrder(order)
      setOrderCreated(true)
      
    } catch (error) {
      console.error('Order creation error:', error)
      alert('There was an error creating your order. Please try again.')
    } finally {
      setIsCheckingOut(false)
    }
  }

  const handleWebPayment = () => {
    if (!createdOrder) return

    // Generate Venmo deep link
    const venmoUsername = 'jasonabrunner' // This should be configured via environment variable
    const amount = getTotalPrice()
    const note = `Order ${createdOrder.orderNumber}: ${state.items.map(item => item.name).join(', ')}`
    
    // Use Venmo web payment URL format
    const venmoUrl = `https://account.venmo.com/pay?recipients=${venmoUsername}&amount=${amount}&note=${encodeURIComponent(note)}`
    
    // Clear cart and redirect to Venmo, then to thank you page
    clearCart()
    // Open Venmo in new tab and redirect to thank you page
    window.open(venmoUrl, '_blank')
    window.location.href = `/thank-you?order=${createdOrder.orderNumber}`
  }

  const handleMobilePayment = () => {
    if (!createdOrder) return

    // Generate Venmo deep link
    const venmoUsername = 'jasonabrunner' // This should be configured via environment variable
    const amount = getTotalPrice()
    const note = `Order ${createdOrder.orderNumber}: ${state.items.map(item => item.name).join(', ')}`
    
    // Use Venmo app deep link for QR code
    const venmoUrl = `venmo://paycharge?txn=pay&recipients=${venmoUsername}&amount=${amount}&note=${encodeURIComponent(note)}`
    
    // Set QR code data and show it
    setVenmoQRData(venmoUrl)
    setShowQRCode(true)
    
    // Don't clear cart yet - let customer complete payment first
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation cartCount={0} />
        
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white">Shopping Cart</h1>
            </div>
          </div>
        </div>
        
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                <p className="text-gray-600 mb-8">Add some products to get started!</p>
                <a
                  href="/"
                  className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  Continue Shopping
                </a>
              </div>
            </div>
          </div>
        </section>
        
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation cartCount={state.items.length} />
      
      <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Shopping Cart</h1>
          </div>
        </div>
      </div>
      
      <section className="py-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-3">
                {state.items.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center space-x-4">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={60}
                          height={60}
                          className="w-15 h-15 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-15 h-15 bg-gray-200 rounded-lg flex items-center justify-center">
                          <div className="text-gray-400 text-xs text-center">
                            <div className="w-6 h-6 bg-gray-300 rounded mx-auto mb-1"></div>
                            No Image
                          </div>
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-700">${item.price.toFixed(2)} each</p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-blue-300 hover:bg-blue-400 flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4 text-black" />
                        </button>
                        <span className="w-8 text-center font-semibold text-black">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-blue-300 hover:bg-blue-400 flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4 text-black" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 text-sm mt-1"
                        >
                          <Trash2 className="w-4 h-4 inline mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Order Summary / Payment Options */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
                {orderCreated && createdOrder ? (
                  // Payment Options Content
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <h3 className="text-lg font-semibold text-green-800 mb-2">Order Created Successfully!</h3>
                      <p className="text-green-700">Order Number: <span className="font-mono font-bold">{createdOrder.orderNumber}</span></p>
                      <p className="text-green-600 text-sm mt-1">Choose your payment method:</p>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Web Payment Button */}
                      <button
                        onClick={handleWebPayment}
                        className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CreditCard className="w-5 h-5 mr-2" />
                        <div className="text-left">
                          <div className="font-semibold text-sm">Pay on Computer</div>
                          <div className="text-xs opacity-90">Open Venmo in browser</div>
                        </div>
                      </button>
                      
                      {/* Mobile Payment Button */}
                      <button
                        onClick={handleMobilePayment}
                        className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <QrCode className="w-5 h-5 mr-2" />
                        <div className="text-left">
                          <div className="font-semibold text-sm">Pay with Phone</div>
                          <div className="text-xs opacity-90">Scan QR code with Venmo app</div>
                        </div>
                      </button>
                    </div>
                  </>
                ) : (
                  // Order Summary & Checkout Form Content
                  <>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h2>
                    
                    <div className="space-y-2 mb-4">
                      {state.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-700">{item.name} x{item.quantity}</span>
                          <span className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-gray-400 pt-3 mb-4">
                      <div className="flex justify-between text-lg text-gray-900 font-semibold">
                        <span>Total</span>
                        <span>${getTotalPrice().toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {/* Customer Information */}
                    <div className="space-y-3 mb-4">
                      <h3 className="text-sm font-semibold text-gray-900">Customer Information *</h3>
                      
                      {/* Name Field */}
                      <div className="text-gray-900">
                        <input
                          type="text"
                          placeholder="Full Name *"
                          value={customerName}
                          onChange={(e) => {
                            setCustomerName(e.target.value)
                            if (formErrors.customerName) {
                              setFormErrors(prev => ({ ...prev, customerName: '' }))
                            }
                          }}
                          className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                            formErrors.customerName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.customerName && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.customerName}</p>
                        )}
                      </div>

                      {/* Email Field */}
                      <div className="text-gray-900">
                        <input
                          type="email"
                          placeholder="Email Address *"
                          value={customerEmail}
                          onChange={(e) => {
                            setCustomerEmail(e.target.value)
                            if (formErrors.customerEmail) {
                              setFormErrors(prev => ({ ...prev, customerEmail: '' }))
                            }
                          }}
                          className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                            formErrors.customerEmail ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.customerEmail && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.customerEmail}</p>
                        )}
                      </div>

                      {/* Phone Field */}
                      <div className="text-gray-900">
                        <input
                          type="tel"
                          placeholder="Phone Number *"
                          value={customerPhone}
                          onChange={(e) => {
                            setCustomerPhone(e.target.value)
                            if (formErrors.customerPhone) {
                              setFormErrors(prev => ({ ...prev, customerPhone: '' }))
                            }
                          }}
                          className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                            formErrors.customerPhone ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.customerPhone && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.customerPhone}</p>
                        )}
                      </div>

                      {/* Address Field */}
                      <div className="text-gray-900">
                        <textarea
                          placeholder="Shipping Address *"
                          value={customerAddress}
                          onChange={(e) => {
                            setCustomerAddress(e.target.value)
                            if (formErrors.customerAddress) {
                              setFormErrors(prev => ({ ...prev, customerAddress: '' }))
                            }
                          }}
                          rows={2}
                          className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 ${
                            formErrors.customerAddress ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.customerAddress && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.customerAddress}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* CAPTCHA Section */}
                    <Captcha onVerify={handleCaptchaVerify} />
                    {formErrors.captcha && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.captcha}</p>
                    )}
                    
                    <button
                      onClick={handleCreateOrder}
                      disabled={isCheckingOut || !captchaVerified}
                      className={`w-full flex items-center justify-center px-4 py-2 text-sm rounded-lg font-semibold transition-colors ${
                        isCheckingOut || !captchaVerified
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isCheckingOut ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Creating...</span>
                        </div>
                      ) : !captchaVerified ? (
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4" />
                          <span>Complete Verification to Create Order</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4" />
                          <span>Create Order - ${getTotalPrice().toFixed(2)}</span>
                        </div>
                      )}
                    </button>
                    
                    <p className="text-xs text-gray-500 text-center mt-4">
                      After creating your order, choose your preferred payment method
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </section>
      
      {/* Ensure proper spacing before footer */}
      <div className="bg-gray-50">
        <Footer />
      </div>
      
      {/* QR Code Modal */}
      {showQRCode && venmoQRData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Scan to Pay</h3>
              <QRCodeGenerator 
                data={venmoQRData} 
                size={250}
                className="mb-4"
              />
              <p className="text-sm text-gray-600 mb-4">Scan with your phone's camera or Venmo app</p>
              <p className="text-xs text-gray-500 mb-6">Order: {createdOrder?.orderNumber}</p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    clearCart()
                    setShowQRCode(false)
                    setOrderCreated(false)
                    // Redirect to thank you page
                    window.location.href = `/thank-you?order=${createdOrder?.orderNumber}`
                  }}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Payment Complete
                </button>
                <button
                  onClick={() => setShowQRCode(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
