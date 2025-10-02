'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { ShoppingCart, Menu, X, ChevronDown } from 'lucide-react'

interface NavigationProps {
  cartCount?: number
}

export default function Navigation({ cartCount = 0 }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(false)
  const policiesRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (policiesRef.current && !policiesRef.current.contains(event.target as Node)) {
        setIsPoliciesOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-48">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="flex items-center space-x-2">
                <img src="/images/jblogo.png" alt="JB Inverters" className="h-48" />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Home
            </Link>
            <Link
              href="/mail-in-service"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Mail-In Service
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Contact
            </Link>
            <div className="relative" ref={policiesRef}>
              <button
                onClick={() => setIsPoliciesOpen(!isPoliciesOpen)}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center space-x-1"
              >
                <span>Policies</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {isPoliciesOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <Link
                    href="/policies/shipping"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    onClick={() => setIsPoliciesOpen(false)}
                  >
                    Shipping Policy
                  </Link>
                  <Link
                    href="/policies/refunds"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    onClick={() => setIsPoliciesOpen(false)}
                  >
                    Refund Policy
                  </Link>
                  <Link
                    href="/policies/terms"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    onClick={() => setIsPoliciesOpen(false)}
                  >
                    Terms & Conditions
                  </Link>
                </div>
              )}
            </div>
            <Link
              href="/cart"
              className="relative text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Link
              href="/cart"
              className="relative text-gray-700 hover:text-gray-900 p-2 mr-2"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-gray-900 p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link
                href="/"
                className="text-gray-700 hover:text-gray-900 block px-3 py-2 text-base font-medium"
                onClick={() => {
                  setIsMenuOpen(false)
                  setIsPoliciesOpen(false)
                }}
              >
                Home
              </Link>
              <Link
                href="/mail-in-service"
                className="text-gray-700 hover:text-gray-900 block px-3 py-2 text-base font-medium"
                onClick={() => {
                  setIsMenuOpen(false)
                  setIsPoliciesOpen(false)
                }}
              >
                Mail-In Service
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-gray-900 block px-3 py-2 text-base font-medium"
                onClick={() => {
                  setIsMenuOpen(false)
                  setIsPoliciesOpen(false)
                }}
              >
                Contact
              </Link>
              <div>
                <button
                  onClick={() => setIsPoliciesOpen(!isPoliciesOpen)}
                  className="text-gray-700 hover:text-gray-900 block px-3 py-2 text-base font-medium flex items-center justify-between w-full"
                >
                  <span>Policies</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isPoliciesOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isPoliciesOpen && (
                  <div className="pl-4 space-y-1">
                    <Link
                      href="/policies/shipping"
                      className="text-gray-600 hover:text-gray-900 block px-3 py-2 text-sm font-medium"
                      onClick={() => {
                        setIsMenuOpen(false)
                        setIsPoliciesOpen(false)
                      }}
                    >
                      Shipping Policy
                    </Link>
                    <Link
                      href="/policies/refunds"
                      className="text-gray-600 hover:text-gray-900 block px-3 py-2 text-sm font-medium"
                      onClick={() => {
                        setIsMenuOpen(false)
                        setIsPoliciesOpen(false)
                      }}
                    >
                      Refund Policy
                    </Link>
                    <Link
                      href="/policies/terms"
                      className="text-gray-600 hover:text-gray-900 block px-3 py-2 text-sm font-medium"
                      onClick={() => {
                        setIsMenuOpen(false)
                        setIsPoliciesOpen(false)
                      }}
                    >
                      Terms & Conditions
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
