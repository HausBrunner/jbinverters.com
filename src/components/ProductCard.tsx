'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ShoppingCart, ExternalLink } from 'lucide-react'
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

interface ProductCardProps {
  product: Product
  onMailInClick?: () => void
}

export default function ProductCard({ product, onMailInClick }: ProductCardProps) {
  const { addItem } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async () => {
    if (product.id === 'mail-in-service' && onMailInClick) {
      onMailInClick()
      return
    }

    setIsAdding(true)
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl || undefined,
    })
    
    // Simulate loading state
    setTimeout(() => setIsAdding(false), 500)
  }

  const isMailInService = product.id === 'mail-in-service'

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-900 overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-w-16 aspect-h-12 bg-white">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={400}
            height={300}
            className="w-full h-52 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-white flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-2"></div>
              <p className="text-sm">No Image</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-gray-700 text-sm mb-4 line-clamp-3">
            {product.description}
          </p>
        )}
        
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
              {product.stock > 0 && !isMailInService && (
                <span className="text-sm text-green-600 font-medium">
                  In Stock ({product.stock})
                </span>
              )}
            </div>
        
        <button
          onClick={handleAddToCart}
          disabled={isAdding || (!isMailInService && product.stock === 0)}
          className={`w-full flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors ${
            isMailInService
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : product.stock === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-900 text-white hover:bg-blue-700'
          }`}
        >
          {isAdding ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Adding...</span>
            </div>
          ) : isMailInService ? (
            <div className="flex items-center space-x-2">
              <ExternalLink className="w-4 h-4" />
              <span>Request Repair</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4" />
              <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
            </div>
          )}
        </button>
      </div>
    </div>
  )
}
