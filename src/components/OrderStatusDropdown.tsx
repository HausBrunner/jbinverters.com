'use client'

import { useState } from 'react'
import { ChevronDown, Mail, Check } from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  customerName: string | null
  customerEmail: string | null
  customerAddress: string | null
  customerPhone: string | null
  total: number
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  createdAt: string
}

interface OrderStatusDropdownProps {
  order: Order
  onStatusUpdate: () => void
}

const statusOptions = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'PAID', label: 'Paid', color: 'bg-blue-100 text-blue-800' },
  { value: 'PROCESSING', label: 'Processing', color: 'bg-purple-100 text-purple-800' },
  { value: 'SHIPPED', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'DELIVERED', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
]

export default function OrderStatusDropdown({ order, onStatusUpdate }: OrderStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  const currentStatus = statusOptions.find(option => option.value === order.status)

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === order.status) {
      setIsOpen(false)
      return
    }

    setIsUpdating(true)
    
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          sendEmail: false, // We'll handle email separately
        }),
      })

      if (response.ok) {
        onStatusUpdate()
        setIsOpen(false)
        setSelectedStatus(null)
      } else {
        alert('Failed to update order status')
      }
    } catch (error) {
      alert('Error updating order status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStatusChangeWithEmail = async (newStatus: string) => {
    if (newStatus === order.status) {
      setIsOpen(false)
      return
    }

    if (!order.customerEmail) {
      alert('No customer email available for this order')
      return
    }

    setIsUpdating(true)
    
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          sendEmail: true,
        }),
      })

      if (response.ok) {
        onStatusUpdate()
        setIsOpen(false)
        setSelectedStatus(null)
      } else {
        alert('Failed to update order status')
      }
    } catch (error) {
      alert('Error updating order status')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${currentStatus?.color} hover:opacity-80 disabled:opacity-50`}
      >
        {isUpdating ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
        ) : (
          <ChevronDown className="w-3 h-3 mr-1" />
        )}
        {currentStatus?.label}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <div className="py-1">
            {selectedStatus ? (
              // Show email options for selected status
              <div>
                <div className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                  Change to: {statusOptions.find(opt => opt.value === selectedStatus)?.label}
                </div>
                <button
                  onClick={() => handleStatusChange(selectedStatus)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  Update status only
                </button>
                {order.customerEmail ? (
                  <button
                    onClick={() => handleStatusChangeWithEmail(selectedStatus)}
                    className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 flex items-center"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Update + Email customer
                  </button>
                ) : (
                  <div className="px-4 py-2 text-xs text-gray-500">
                    No customer email available
                  </div>
                )}
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={() => setSelectedStatus(null)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
                >
                  ← Back to status list
                </button>
              </div>
            ) : (
              // Show status list
              <>
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      if (option.value !== order.status) {
                        setSelectedStatus(option.value)
                      }
                    }}
                    disabled={option.value === order.status}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                      option.value === order.status ? 'bg-gray-50 text-gray-400 cursor-default' : 'cursor-pointer'
                    }`}
                  >
                    <span>{option.label}</span>
                    {option.value === order.status && (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                  </button>
                ))}
              </>
            )}
          </div>
          
          <div className="border-t border-gray-200 py-1">
            <button
              onClick={() => {
                setIsOpen(false)
                setSelectedStatus(null)
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setIsOpen(false)
            setSelectedStatus(null)
          }}
        />
      )}
    </div>
  )
}
