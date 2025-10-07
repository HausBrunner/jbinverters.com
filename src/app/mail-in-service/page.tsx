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
      <section className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Professional repair service for your inverter or power equipment. 
              Send us your device and we'll diagnose and repair it with expert care.
            </p>
          </div>
        </div>
      </section>

      {/* Service Details */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                How Our Mail-In Service Works
              </h2>
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <step.icon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-700">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Service Details
              </h3>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-700">Service Fee:</span>
                  <span className="font-semibold text-gray-700">$89.99</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Diagnosis Time:</span>
                  <span className="font-semibold text-gray-700">2-3 business days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Repair Time:</span>
                  <span className="font-semibold text-gray-700">5-7 business days</span>
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
                    <span>Adding to Cart...</span>
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

      {/* Instructions Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Shipping Instructions
          </h2>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Packaging Guidelines
            </h3>
            <ul className="space-y-3 text-gray-700 mb-8">
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Use a sturdy cardboard box with adequate padding (bubble wrap, foam, or newspaper)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Remove any loose cables or accessories and wrap them separately</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Include a detailed description of the problem you're experiencing</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Include your contact information (name, phone, email)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Consider purchasing shipping insurance for valuable equipment</span>
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Shipping Address
            </h3>
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <p className="font-semibold text-gray-900">JB Inverters</p>
              <p className="font-semibold text-gray-900">5330 W Palmer Dr</p>
              <p className="font-semibold text-gray-900">Banning, CA 92220</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Important Notes:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• The $89.99 service fee covers diagnosis and basic repairs</li>
                <li>• Additional parts or complex repairs will be quoted separately</li>
                <li>• We'll contact you before proceeding with any additional charges</li>
                <li>• Return shipping is included in the service fee</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
