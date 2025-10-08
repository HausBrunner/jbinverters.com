'use client'

import { useState } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { useCart } from '@/contexts/CartContext'
import { ShoppingCart, Package, Wrench, Clock, CheckCircle } from 'lucide-react'

export default function MailInServicePage() {
  const { addItem, getTotalItems } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = () => {
    setIsAdding(true)
    addItem({
      id: 'mail-in-service',
      name: 'Mail-In Repair Service',
      price: 89.99,
      imageUrl: '/images/mail-in-service.svg',
    })
    
    setTimeout(() => setIsAdding(false), 500)
  }

  const steps = [
    {
      icon: Package,
      title: 'Package Your Device',
      description: 'Safely package your inverter or power equipment in a sturdy box with padding.'
    },
    {
      icon: Wrench,
      title: 'Include Details',
      description: 'Write down the issue you\'re experiencing and include it with your device.'
    },
    {
      icon: Clock,
      title: 'Send to Us',
      description: 'Ship your device to our repair facility using the address provided.'
    },
    {
      icon: CheckCircle,
      title: 'Get Estimate',
      description: 'We\'ll diagnose the issue and provide a repair estimate within 2-3 business days.'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation cartCount={getTotalItems()} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-3">Mail-In Repair Service</h1>
            <p className="text-lg text-blue-200 max-w-2xl mx-auto">
              Professional repair service for your inverter or power equipment. 
              Send us your device and we'll diagnose and repair it with expert care.
            </p>
          </div>
        </div>
      </section>

      {/* Service Details */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* How It Works */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                How Our Mail-In Service Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <step.icon className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-700">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Service Details & Order */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Service Details
              </h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-700">Service Fee:</span>
                  <span className="font-semibold text-gray-700">$89.99</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Diagnosis:</span>
                  <span className="font-semibold text-gray-700">2-3 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Repair:</span>
                  <span className="font-semibold text-gray-700">5-7 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Warranty:</span>
                  <span className="font-semibold text-gray-700">90 days</span>
                </div>
              </div>
              
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-colors ${
                  isAdding
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isAdding ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Adding...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="w-5 h-5" />
                    <span>Add to Cart - $89.99</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Shipping Instructions */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Shipping Instructions
              </h2>
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Packaging Guidelines</h3>
                <ul className="space-y-2 text-sm text-gray-700 mb-6">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Use sturdy box with adequate padding</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Remove loose cables and wrap separately</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Include detailed problem description</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Include your contact information</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Consider shipping insurance</span>
                  </li>
                </ul>

                <h3 className="font-semibold text-gray-900 mb-3">Shipping Address</h3>
                <div className="bg-gray-100 rounded-lg p-3 mb-4">
                  <p className="font-semibold text-gray-900">JB Inverters</p>
                  <p className="font-semibold text-gray-900">5330 W Palmer Dr</p>
                  <p className="font-semibold text-gray-900">Banning, CA 92220</p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <h4 className="font-semibold text-yellow-800 mb-2 text-sm">Important:</h4>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>• Service fee covers diagnosis and basic repairs</li>
                    <li>• Additional repairs quoted separately</li>
                    <li>• We'll contact before additional charges</li>
                    <li>• Return shipping included</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                90-Day Warranty
              </h2>
              <div className="bg-white rounded-lg p-6">
                <p className="text-sm text-gray-700 mb-4">
                  All mail-in repair services come with a comprehensive 90-day parts and labor warranty.
                </p>

                <div className="grid grid-cols-1 gap-4 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">What's Covered</h3>
                    <ul className="space-y-1 text-xs text-gray-700">
                      <li className="flex items-start space-x-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>Manufacturing defects & premature failure</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>Technician error & repair work failure</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>Parts & labor costs for warranty repairs</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">Not Covered</h3>
                    <ul className="space-y-1 text-xs text-gray-700">
                      <li className="flex items-start space-x-2">
                        <span className="text-red-600 mt-1">✗</span>
                        <span>Misuse, abuse, or neglect damage</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-red-600 mt-1">✗</span>
                        <span>Accidents, natural disasters, wear & tear</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-red-600 mt-1">✗</span>
                        <span>Unauthorized modifications</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-semibold text-blue-800 mb-2 text-sm">Warranty Process:</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Contact us within 90 days with your order number</li>
                    <li>• We'll determine if issue is covered</li>
                    <li>• Free repair if covered under warranty</li>
                    <li>• Response within 24-48 hours</li>
                    <li>• All shipping costs covered by us</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
