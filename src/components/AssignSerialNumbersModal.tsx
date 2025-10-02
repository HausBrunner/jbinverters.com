'use client'

import { useState, useEffect } from 'react'
import { X, Check, Search } from 'lucide-react'

interface SerialNumber {
  id: string
  serialNumber: string
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'DEFECTIVE' | 'RETURNED'
  notes: string | null
}

interface AssignSerialNumbersModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  orderNumber: string
  productId: string
  productName: string
  quantity: number
  onSerialNumbersAssigned: () => void
}

export default function AssignSerialNumbersModal({ 
  isOpen, 
  onClose, 
  orderId, 
  orderNumber, 
  productId, 
  productName, 
  quantity,
  onSerialNumbersAssigned 
}: AssignSerialNumbersModalProps) {
  const [availableSerialNumbers, setAvailableSerialNumbers] = useState<SerialNumber[]>([])
  const [selectedSerialNumbers, setSelectedSerialNumbers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (isOpen && productId) {
      fetchAvailableSerialNumbers()
    }
  }, [isOpen, productId])

  const fetchAvailableSerialNumbers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/serial-numbers?productId=${productId}`)
      if (response.ok) {
        const data = await response.json()
        // Filter to only show available serial numbers
        const available = data.filter((serial: SerialNumber) => serial.status === 'AVAILABLE')
        setAvailableSerialNumbers(available)
      }
    } catch (error) {
      console.error('Error fetching serial numbers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSerialNumberToggle = (serialId: string) => {
    setSelectedSerialNumbers(prev => {
      if (prev.includes(serialId)) {
        return prev.filter(id => id !== serialId)
      } else if (prev.length < quantity) {
        return [...prev, serialId]
      }
      return prev
    })
  }

  const handleAssign = async () => {
    if (selectedSerialNumbers.length === 0) {
      alert('Please select at least one serial number')
      return
    }

    if (selectedSerialNumbers.length > quantity) {
      alert(`You can only assign ${quantity} serial numbers for this order`)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/serial-numbers/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          serialNumberIds: selectedSerialNumbers
        })
      })

      if (response.ok) {
        onSerialNumbersAssigned()
        onClose()
      } else {
        alert('Failed to assign serial numbers')
      }
    } catch (error) {
      alert('Error assigning serial numbers')
    } finally {
      setLoading(false)
    }
  }

  const filteredSerialNumbers = availableSerialNumbers.filter(serial =>
    serial.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (serial.notes && serial.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Assign Serial Numbers</h2>
            <p className="text-sm text-gray-600">
              Order {orderNumber} - {productName} (Quantity: {quantity})
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search serial numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </div>

          {/* Selection Info */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Selected: {selectedSerialNumbers.length} of {quantity} required
            </p>
          </div>

          {/* Serial Numbers List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : filteredSerialNumbers.length === 0 ? (
            <div className="text-center py-8 text-gray-700">
              No available serial numbers found
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredSerialNumbers.map((serial) => (
                <button
                  key={serial.id}
                  onClick={() => handleSerialNumberToggle(serial.id)}
                  disabled={selectedSerialNumbers.length >= quantity && !selectedSerialNumbers.includes(serial.id)}
                  className={`w-full p-3 border rounded-lg transition-colors text-left ${
                    selectedSerialNumbers.includes(serial.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${
                    selectedSerialNumbers.length >= quantity && !selectedSerialNumbers.includes(serial.id)
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                        selectedSerialNumbers.includes(serial.id)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedSerialNumbers.includes(serial.id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                        <div>
                          <p className="font-medium text-gray-900">{serial.serialNumber}</p>
                          {serial.notes && (
                            <p className="text-sm text-gray-700">{serial.notes}</p>
                          )}
                        </div>
                    </div>
                    <span className="text-xs text-green-800 bg-green-100 px-2 py-1 rounded-full font-medium">
                      Available
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={loading || selectedSerialNumbers.length === 0 || selectedSerialNumbers.length > quantity}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Assigning...' : `Assign ${selectedSerialNumbers.length} Serial Number${selectedSerialNumbers.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}
