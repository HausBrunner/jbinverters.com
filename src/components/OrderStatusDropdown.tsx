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
  status: 'ORDER_RECEIVED' | 'PAID_PENDING_SHIPMENT' | 'PAID' | 'CANCELLED' | 'RECEIVED' | 'QUOTE_SENT' | 'REPAIRING' | 'SHIPPED_AND_COMPLETE'
  createdAt: string
  items?: Array<{
    id: string
    product: {
      id: string
      name: string
    }
    quantity: number
    price: number
  }>
}

interface OrderStatusDropdownProps {
  order: Order
  onStatusUpdate: () => void
}

const regularStatusOptions = [
  { value: 'ORDER_RECEIVED', label: 'Order Received', color: 'bg-gray-100 text-gray-800' },
  { value: 'PAID_PENDING_SHIPMENT', label: 'Payment Received and Order Pending', color: 'bg-blue-100 text-blue-800' },
  { value: 'SHIPPED_AND_COMPLETE', label: 'Shipped & Complete', color: 'bg-green-100 text-green-800' },
  { value: 'CANCELLED', label: 'Cancel Order', color: 'bg-red-100 text-red-800' },
]

const repairStatusOptions = [
  { value: 'ORDER_RECEIVED', label: 'Order Received', color: 'bg-gray-100 text-gray-800' },
  { value: 'PAID', label: 'Payment Received', color: 'bg-blue-100 text-blue-800' },
  { value: 'RECEIVED', label: 'Device Received', color: 'bg-orange-100 text-orange-800' },
  { value: 'QUOTE_SENT', label: 'Diagnostic Complete and Quote Sent', color: 'bg-pink-100 text-pink-800' },
  { value: 'REPAIRING', label: 'Repairing', color: 'bg-purple-100 text-purple-800' },
  { value: 'SHIPPED_AND_COMPLETE', label: 'Shipped & Complete', color: 'bg-green-100 text-green-800' },
  { value: 'CANCELLED', label: 'Cancel Order', color: 'bg-red-100 text-red-800' },
]

export default function OrderStatusDropdown({ order, onStatusUpdate }: OrderStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  // Check if this order contains a mail-in repair service
  const hasRepairService = order.items?.some((item: any) => item.product.id === 'mail-in-service') || false
  
  // Use repair-specific status options if this is a repair service order
  const statusOptions = hasRepairService ? repairStatusOptions : regularStatusOptions
  
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
                      option.value === order.status ? 'bg-gray-50 text-gray-400 cursor-default' : 'cursor-pointer text-gray-900'
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
