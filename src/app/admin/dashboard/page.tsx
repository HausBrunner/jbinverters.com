'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Package, 
  ShoppingCart, 
  Plus,
  Edit,
  LogOut,
  Eye,
  Hash,
  Search,
  Filter,
  Archive,
  ArchiveRestore,
  StickyNote,
  Trash2
} from 'lucide-react'
import AddProductModal from '@/components/AddProductModal'
import EditProductModal from '@/components/EditProductModal'
import OrderStatusDropdown from '@/components/OrderStatusDropdown'
import SerialNumberModal from '@/components/SerialNumberModal'
import AssignSerialNumbersModal from '@/components/AssignSerialNumbersModal'
import ErrorBoundary from '@/components/ErrorBoundary'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  stock: number
  displayOrder: number
  isActive: boolean
  createdAt: string
}

interface Order {
  id: string
  orderNumber: string
  customerName: string | null
  customerEmail: string | null
  customerAddress: string | null
  customerPhone: string | null
  total: number
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  internalNotes: string | null
  isArchived: boolean
  createdAt: string
  items: {
    id: string
    productId: string
    quantity: number
    price: number
    product: {
      id: string
      name: string
    }
  }[]
  serialNumbers: {
    id: string
    serialNumber: string
    status: string
    notes: string | null
    product: {
      id: string
      name: string
    }
  }[]
}


export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false)
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isSerialNumberModalOpen, setIsSerialNumberModalOpen] = useState(false)
  const [isAssignSerialNumbersModalOpen, setIsAssignSerialNumbersModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<{
    orderId: string
    orderNumber: string
    productId: string
    productName: string
    quantity: number
  } | null>(null)
  const [orderSearchTerm, setOrderSearchTerm] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL')
  const [orderSortBy, setOrderSortBy] = useState('createdAt')
  const [orderSortOrder, setOrderSortOrder] = useState('desc')
  const [showArchived, setShowArchived] = useState(false)
  const [editingOrderNotes, setEditingOrderNotes] = useState<string | null>(null)
  const [orderNotes, setOrderNotes] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (status === 'authenticated') {
      fetchData()
    }
  }, [status, router])

  // Refetch orders when filters change
  useEffect(() => {
    if (status === 'authenticated' && activeTab === 'orders') {
      fetchData()
    }
  }, [orderSearchTerm, orderStatusFilter, orderSortBy, orderSortOrder, showArchived, activeTab])

  const fetchData = async () => {
    try {
      // Build orders URL with filters
      const ordersParams = new URLSearchParams()
      if (orderSearchTerm) ordersParams.append('search', orderSearchTerm)
      if (orderStatusFilter !== 'ALL') ordersParams.append('status', orderStatusFilter)
      if (orderSortBy) ordersParams.append('sortBy', orderSortBy)
      if (orderSortOrder) ordersParams.append('sortOrder', orderSortOrder)
      ordersParams.append('archived', showArchived.toString())

      const [productsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch(`/api/admin/orders?${ordersParams.toString()}`)
      ])

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData)
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ordersData)
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const handleProductAdded = () => {
    fetchData() // Refresh the data
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsEditProductModalOpen(true)
  }

  const handleManageSerialNumbers = (product: Product) => {
    setSelectedProduct(product)
    setIsSerialNumberModalOpen(true)
  }

  const handleAssignSerialNumbers = (order: Order, item: any) => {
    setSelectedOrder({
      orderId: order.id,
      orderNumber: order.orderNumber,
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity
    })
    setIsAssignSerialNumbersModalOpen(true)
  }

  const handleEditOrderNotes = (order: Order) => {
    setEditingOrderNotes(order.id)
    setOrderNotes(order.internalNotes || '')
  }

  const handleSaveOrderNotes = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: orderNotes })
      })

      if (response.ok) {
        setEditingOrderNotes(null)
        setOrderNotes('')
        fetchData()
      } else {
        alert('Failed to update order notes')
      }
    } catch (error) {
      alert('Error updating order notes')
    }
  }

  const handleArchiveOrder = async (orderId: string, isArchived: boolean) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/archive`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived })
      })

      if (response.ok) {
        fetchData()
      } else {
        alert(`Failed to ${isArchived ? 'archive' : 'unarchive'} order`)
      }
    } catch (error) {
      alert(`Error ${isArchived ? 'archiving' : 'unarchiving'} order`)
    }
  }


  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchData() // Refresh data after deleting product
      } else {
        alert('Failed to delete product')
      }
    } catch (error) {
      alert('Error deleting product')
    }
  }

  const handleProductUpdated = () => {
    fetchData() // Refresh data after updating product
    setIsEditProductModalOpen(false)
    setSelectedProduct(null)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0)
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100" data-autofill="disabled">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <span className="text-sm text-gray-500">Welcome, {session.user?.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCart className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCart className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: Eye },
                { id: 'products', name: 'Products', icon: Package },
                { id: 'orders', name: 'Orders', icon: ShoppingCart },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h3>
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">{order.customerName || 'Guest'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${order.total.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Products</h2>
                  <button 
                    onClick={() => setIsAddProductModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full divide-y divide-gray-200 table-fixed">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="w-16 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th className="w-64 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="w-20 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="w-16 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th className="w-20 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td className="px-3 py-4 text-sm text-gray-900 text-center">
                            {product.displayOrder}
                          </td>
                          <td className="px-3 py-4">
                            <div className="truncate">
                              <div className="text-sm font-medium text-gray-900 truncate" title={product.name}>
                                {product.name}
                              </div>
                              {product.description && (
                                <div className="text-xs text-gray-500 truncate mt-1" title={product.description}>
                                  {product.description}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900 text-center">
                            ${product.price.toFixed(2)}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900 text-center">
                            {product.stock}
                          </td>
                          <td className="px-3 py-4 text-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {product.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-sm font-medium">
                            <div className="flex space-x-1 justify-center">
                              <button 
                                onClick={() => handleManageSerialNumbers(product)}
                                className="text-purple-600 hover:text-purple-900 p-1"
                                title="Manage Serial Numbers"
                              >
                                <Hash className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleEditProduct(product)}
                                className="text-blue-600 hover:text-blue-900 p-1"
                                title="Edit Product"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Orders</h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowArchived(!showArchived)}
                      className={`px-3 py-1 text-sm rounded-lg flex items-center space-x-1 ${
                        showArchived 
                          ? 'bg-gray-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <Archive className="w-4 h-4" />
                      <span>{showArchived ? 'Show Active' : 'Show Archived'}</span>
                    </button>
                  </div>
                </div>

                {/* Search and Filter Controls */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search orders..."
                        value={orderSearchTerm}
                        onChange={(e) => setOrderSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Filter className="text-gray-400 w-4 h-4" />
                      <select
                        value={orderStatusFilter}
                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      >
                        <option value="ALL">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={orderSortBy}
                        onChange={(e) => setOrderSortBy(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      >
                        <option value="createdAt">Sort by Date</option>
                        <option value="orderNumber">Sort by Order #</option>
                        <option value="total">Sort by Total</option>
                        <option value="status">Sort by Status</option>
                      </select>
                      <button
                        onClick={() => setOrderSortOrder(orderSortOrder === 'asc' ? 'desc' : 'asc')}
                        className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        {orderSortOrder === 'asc' ? '↑' : '↓'}
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 flex items-center">
                      {orders.length} order{orders.length !== 1 ? 's' : ''} found
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                      {orders.map((order) => (
                    <div key={order.id} className={`bg-white rounded-lg shadow-sm border ${order.isArchived ? 'border-gray-300 bg-gray-50' : 'border-gray-200'}`}>
                      {/* Order Header */}
                      <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-medium text-gray-900">Order {order.orderNumber}</h3>
                              {order.isArchived && (
                                <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded-full">Archived</span>
                              )}
                            </div>
                            <div className="mt-1 text-sm text-gray-600">
                              <p>{order.customerName || 'Guest'} • {order.customerEmail || 'No email'}</p>
                              <p>{order.customerPhone || 'No phone'} • {new Date(order.createdAt).toLocaleDateString()}</p>
                              {order.customerAddress && (
                                <p className="truncate max-w-md">{order.customerAddress}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">${order.total.toFixed(2)}</div>
                            <div className="flex items-center space-x-2 mt-2">
                            <OrderStatusDropdown 
                              order={order} 
                              onStatusUpdate={fetchData}
                            />
                              <button
                                onClick={() => handleArchiveOrder(order.id, !order.isArchived)}
                                className={`p-1 rounded hover:bg-gray-100 ${
                                  order.isArchived ? 'text-blue-600' : 'text-gray-400'
                                }`}
                                title={order.isArchived ? 'Unarchive' : 'Archive'}
                              >
                                {order.isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Internal Notes */}
                      <div className="px-6 py-3 border-b border-gray-200 bg-yellow-50">
                        <div className="flex items-center space-x-2">
                          <StickyNote className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">Internal Notes:</span>
                          {editingOrderNotes === order.id ? (
                            <div className="flex-1 flex items-center space-x-2">
                              <input
                                type="text"
                                value={orderNotes}
                                onChange={(e) => setOrderNotes(e.target.value)}
                                className="flex-1 px-2 py-1 text-sm border border-yellow-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500 text-gray-900"
                                placeholder="Add internal notes..."
                              />
                              <button
                                onClick={() => handleSaveOrderNotes(order.id)}
                                className="text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingOrderNotes(null)
                                  setOrderNotes('')
                                }}
                                className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex-1 flex items-center space-x-2">
                              <span className="text-sm text-yellow-700 flex-1">
                                {order.internalNotes || 'No notes'}
                              </span>
                              <button
                                onClick={() => handleEditOrderNotes(order)}
                                className="text-xs text-yellow-600 hover:text-yellow-800"
                              >
                                {order.internalNotes ? 'Edit' : 'Add'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Serial Numbers */}
                      {order.serialNumbers.length > 0 && (
                        <div className="px-6 py-3 border-b border-gray-200 bg-blue-50">
                          <h4 className="text-sm font-medium text-blue-800 mb-2">Assigned Serial Numbers:</h4>
                          <div className="space-y-1">
                            {order.serialNumbers.map((serial) => (
                              <div key={serial.id} className="flex items-center justify-between text-sm">
                                <div>
                                  <span className="font-medium text-blue-900">{serial.serialNumber}</span>
                                  <span className="text-blue-600 ml-2">({serial.product.name})</span>
                                  {serial.notes && (
                                    <span className="text-blue-500 ml-2">- {serial.notes}</span>
                                  )}
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  serial.status === 'SOLD' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {serial.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Order Items */}
                      <div className="px-6 py-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Items ({order.items.length})</h4>
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">{item.product.name}</p>
                                <p className="text-sm text-gray-600">Quantity: {item.quantity} × ${item.price.toFixed(2)}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900">
                                  ${(item.quantity * item.price).toFixed(2)}
                                </span>
                                {!order.isArchived && (
                                  <button
                                    onClick={() => handleAssignSerialNumbers(order, item)}
                                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                  >
                                    Assign Serial #
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}


          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onProductAdded={handleProductAdded}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditProductModalOpen}
        onClose={() => {
          setIsEditProductModalOpen(false)
          setSelectedProduct(null)
        }}
        onProductUpdated={handleProductUpdated}
        product={selectedProduct}
      />

      {/* Serial Number Modal */}
      <SerialNumberModal
        isOpen={isSerialNumberModalOpen}
        onClose={() => {
          setIsSerialNumberModalOpen(false)
          setSelectedProduct(null)
        }}
        productId={selectedProduct?.id || ''}
        productName={selectedProduct?.name || ''}
      />

      {/* Assign Serial Numbers Modal */}
      <AssignSerialNumbersModal
        isOpen={isAssignSerialNumbersModalOpen}
        onClose={() => {
          setIsAssignSerialNumbersModalOpen(false)
          setSelectedOrder(null)
        }}
        orderId={selectedOrder?.orderId || ''}
        orderNumber={selectedOrder?.orderNumber || ''}
        productId={selectedOrder?.productId || ''}
        productName={selectedOrder?.productName || ''}
        quantity={selectedOrder?.quantity || 0}
        onSerialNumbersAssigned={fetchData}
      />

      </div>
    </ErrorBoundary>
  )
}
