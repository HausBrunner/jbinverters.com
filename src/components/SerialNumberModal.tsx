'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Edit, Save, X as CancelIcon, Search, Filter, Download } from 'lucide-react'

interface SerialNumber {
  id: string
  serialNumber: string
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'DEFECTIVE' | 'RETURNED'
  notes: string | null
  orderId: string | null
  orderNumber: string | null
  createdAt: string
  updatedAt: string
}

interface SerialNumberModalProps {
  isOpen: boolean
  onClose: () => void
  productId: string
  productName: string
}

const statusOptions = [
  { value: 'AVAILABLE', label: 'Available', color: 'bg-green-100 text-green-800' },
  { value: 'SOLD', label: 'Sold', color: 'bg-blue-100 text-blue-800' },
  { value: 'RESERVED', label: 'Reserved', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'DEFECTIVE', label: 'Defective', color: 'bg-red-100 text-red-800' },
  { value: 'RETURNED', label: 'Returned', color: 'bg-gray-100 text-gray-800' },
]

export default function SerialNumberModal({ isOpen, onClose, productId, productName }: SerialNumberModalProps) {
  const [serialNumbers, setSerialNumbers] = useState<SerialNumber[]>([])
  const [filteredSerialNumbers, setFilteredSerialNumbers] = useState<SerialNumber[]>([])
  const [loading, setLoading] = useState(false)
  const [newSerialNumbers, setNewSerialNumbers] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNotes, setEditNotes] = useState('')
  const [editStatus, setEditStatus] = useState<'AVAILABLE' | 'SOLD' | 'RESERVED' | 'DEFECTIVE' | 'RETURNED'>('AVAILABLE')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    if (isOpen && productId) {
      fetchSerialNumbers()
    }
  }, [isOpen, productId])

  // Filter serial numbers based on search and status
  useEffect(() => {
    let filtered = serialNumbers

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(serial =>
        serial.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (serial.notes && serial.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (serial.orderNumber && serial.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(serial => serial.status === statusFilter)
    }

    setFilteredSerialNumbers(filtered)
  }, [serialNumbers, searchTerm, statusFilter])

  const fetchSerialNumbers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/serial-numbers?productId=${productId}`)
      if (response.ok) {
        const data = await response.json()
        setSerialNumbers(data)
      }
    } catch (error) {
      console.error('Error fetching serial numbers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSerialNumbers = async () => {
    if (!newSerialNumbers.trim()) return

    const serialList = newSerialNumbers
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    if (serialList.length === 0) return

    setLoading(true)
    try {
      const response = await fetch('/api/admin/serial-numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          serialNumbers: serialList,
          notes: newNotes.trim() || null
        })
      })

      if (response.ok) {
        setNewSerialNumbers('')
        setNewNotes('')
        fetchSerialNumbers()
      } else {
        alert('Failed to add serial numbers')
      }
    } catch (error) {
      alert('Error adding serial numbers')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (serial: SerialNumber) => {
    setEditingId(serial.id)
    setEditNotes(serial.notes || '')
    setEditStatus(serial.status)
  }

  const handleSaveEdit = async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/serial-numbers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          notes: editNotes.trim() || null
        })
      })

      if (response.ok) {
        setEditingId(null)
        fetchSerialNumbers()
      } else {
        alert('Failed to update serial number')
      }
    } catch (error) {
      alert('Error updating serial number')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this serial number?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/serial-numbers/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchSerialNumbers()
      } else {
        alert('Failed to delete serial number')
      }
    } catch (error) {
      alert('Error deleting serial number')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    const csvContent = [
      ['Serial Number', 'Status', 'Order Number', 'Notes', 'Created Date'],
      ...filteredSerialNumbers.map(serial => [
        serial.serialNumber,
        serial.status,
        serial.orderNumber || '',
        serial.notes || '',
        new Date(serial.createdAt).toLocaleDateString()
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${productName}_serial_numbers_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Serial Numbers - {productName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Add New Serial Numbers */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Add New Serial Numbers</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Serial Numbers (one per line)
                </label>
                <textarea
                  value={newSerialNumbers}
                  onChange={(e) => setNewSerialNumbers(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  rows={3}
                  placeholder="SN001&#10;SN002&#10;SN003"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Batch notes, supplier info, etc."
                />
              </div>
              <button
                onClick={handleAddSerialNumbers}
                disabled={loading || !newSerialNumbers.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Add Serial Numbers</span>
              </button>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search serial numbers, notes, or order numbers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="text-gray-400 w-4 h-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="ALL">All Status</option>
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleExport}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Serial Numbers List */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Serial Numbers ({filteredSerialNumbers.length} of {serialNumbers.length})
            </h3>
            {loading && serialNumbers.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              </div>
            ) : serialNumbers.length === 0 ? (
              <div className="text-center py-8 text-gray-700">
                No serial numbers added yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Serial Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Added
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSerialNumbers.map((serial) => (
                      <tr key={serial.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {serial.serialNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingId === serial.id ? (
                            <select
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value as any)}
                              className="text-xs px-2 py-1 border border-gray-300 rounded text-gray-900 bg-white"
                            >
                              {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              statusOptions.find(s => s.value === serial.status)?.color || 'bg-gray-100 text-gray-800'
                            }`}>
                              {statusOptions.find(s => s.value === serial.status)?.label || serial.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {serial.orderNumber ? (
                            <span className="font-medium text-blue-600">{serial.orderNumber}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                          {editingId === serial.id ? (
                            <input
                              type="text"
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                              placeholder="Add notes..."
                            />
                          ) : (
                            <span className="truncate block" title={serial.notes || ''}>
                              {serial.notes || '-'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(serial.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {editingId === serial.id ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSaveEdit(serial.id)}
                                disabled={loading}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <CancelIcon className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(serial)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(serial.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
