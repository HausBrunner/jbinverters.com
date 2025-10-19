'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { useCart } from '@/contexts/CartContext'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  stock: number
  isActive: boolean
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { getTotalItems } = useCart()
  const router = useRouter()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        if (response.ok) {
          const data = await response.json()
          setProducts(data)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleMailInClick = () => {
    router.push('/mail-in-service')
  }

  // Show all products including mail-in service in the same grid
  const allProducts = products

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation cartCount={getTotalItems()} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Quality inverters, battery chargers, and repair services for all your electrical needs. 
            From RV power systems to off-grid solutions, we've got you covered.
            </p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="animate-pulse">
                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allProducts.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onMailInClick={product.id === 'mail-in-service' ? handleMailInClick : undefined}
                  isPriority={index < 3} // Priority for first 3 images (above the fold)
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}