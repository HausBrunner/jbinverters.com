'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface EmailTemplates {
  product: any
  repair: any
}

export default function EmailTemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<EmailTemplates | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'product' | 'repair'>('product')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [previewData, setPreviewData] = useState<{ subject: string; html: string } | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/email-templates')
      if (!response.ok) {
        throw new Error('Failed to fetch templates')
      }
      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      console.error('Error fetching templates:', error)
      setError('Failed to load email templates')
    } finally {
      setLoading(false)
    }
  }

  const saveTemplates = async (templateType: 'product' | 'repair') => {
    if (!templates) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const response = await fetch('/api/admin/email-templates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateType,
          templates: templates[templateType]
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save templates')
      }

      setSuccess(`${templateType === 'product' ? 'Product' : 'Repair'} templates saved successfully!`)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error('Error saving templates:', error)
      setError(error instanceof Error ? error.message : 'Failed to save templates')
    } finally {
      setSaving(false)
    }
  }

  const updateTemplate = (templateType: 'product' | 'repair', path: string, value: any) => {
    if (!templates) return

    setTemplates(prev => {
      if (!prev) return null
      
      const newTemplates = { ...prev }
      const keys = path.split('.')
      let current = newTemplates[templateType]
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {}
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newTemplates
    })
  }

  const generatePreview = async (templateType: 'product' | 'repair', status: string) => {
    if (!templates) return

    setPreviewLoading(true)
    try {
      // Create sample order data
      const sampleOrder = {
        id: 'sample-order-id',
        orderNumber: 'JB-1234567890-ABCD',
        customerName: 'John Doe',
        customerEmail: 'john.doe@example.com',
        customerAddress: templateType === 'product' ? '123 Main St, Anytown, USA 12345' : undefined,
        total: 299.99,
        createdAt: new Date().toISOString(),
        items: [
          {
            product: {
              id: templateType === 'repair' ? 'mail-in-service' : 'sample-product',
              name: templateType === 'repair' ? 'Mail-in Repair Service' : 'Sample Product'
            },
            quantity: 1,
            price: 299.99
          }
        ],
        repairQuote: status === 'QUOTE_SENT' ? 'Sample repair quote:\n\nParts needed: $150\nLabor: $100\nTotal: $250' : null
      }

      const response = await fetch('/api/admin/email-templates/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateType,
          status: status === 'initial' ? 'initial' : status,
          orderData: sampleOrder
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate preview')
      }

      const previewContent = await response.json()
      setPreviewData(previewContent)
      setPreviewMode(true)
    } catch (error) {
      console.error('Error generating preview:', error)
      setError('Failed to generate email preview')
    } finally {
      setPreviewLoading(false)
    }
  }

  const renderTemplateEditor = (templateType: 'product' | 'repair') => {
    if (!templates) return null

    const template = templates[templateType]

    return (
      <div className="space-y-6">
        {/* Initial Confirmation Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Initial Confirmation Email</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={template.initialConfirmation.subject}
                onChange={(e) => updateTemplate(templateType, 'initialConfirmation.subject', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={template.initialConfirmation.content}
                onChange={(e) => updateTemplate(templateType, 'initialConfirmation.content', e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Enter email content. Use [customerName], [orderNumber], etc. for variables."
              />
              <div className="mt-2">
                <button
                  onClick={() => generatePreview(templateType, 'initial')}
                  disabled={previewLoading}
                  className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  {previewLoading ? 'Generating...' : 'Preview Email'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Updates Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Update Emails</h3>
          
          <div className="space-y-4">
            {Object.entries(template.statusUpdates).map(([status, config]: [string, any]) => (
              <div key={status} className="border border-gray-200 p-4 rounded-md">
                <h4 className="font-medium text-gray-900 mb-2">
                  {status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={config.subject}
                      onChange={(e) => updateTemplate(templateType, `statusUpdates.${status}.subject`, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      value={config.message}
                      onChange={(e) => updateTemplate(templateType, `statusUpdates.${status}.message`, e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                    <div className="mt-1">
                      <button
                        onClick={() => generatePreview(templateType, status)}
                        disabled={previewLoading}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-50"
                      >
                        {previewLoading ? 'Generating...' : 'Preview'}
                      </button>
                    </div>
                  </div>

                  {/* Special fields for QUOTE_SENT */}
                  {status === 'QUOTE_SENT' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Message with Quote
                        </label>
                        <textarea
                          value={config.messageWithQuote || ''}
                          onChange={(e) => updateTemplate(templateType, `statusUpdates.${status}.messageWithQuote`, e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          placeholder="Message when repair quote is available"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={() => saveTemplates(templateType)}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : `Save ${templateType === 'product' ? 'Product' : 'Repair'} Templates`}
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading email templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
              <p className="mt-2 text-gray-600">
                Manage email templates for product orders and repair services
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('product')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'product'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Product Orders
              </button>
              <button
                onClick={() => setActiveTab('repair')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'repair'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Repair Services
              </button>
            </nav>
          </div>
        </div>

        {/* Template Editor */}
        {renderTemplateEditor(activeTab)}

        {/* Variables Help */}
        <div className="mt-8 bg-blue-50 border border-blue-200 p-6 rounded-md">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Available Variables</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">General Variables:</h4>
              <ul className="space-y-1 text-blue-700">
                <li><code className="bg-blue-100 px-1 rounded">[customerName]</code> - Customer's name</li>
                <li><code className="bg-blue-100 px-1 rounded">[orderNumber]</code> - Order number</li>
                <li><code className="bg-blue-100 px-1 rounded">[orderDate]</code> - Formatted order date</li>
                <li><code className="bg-blue-100 px-1 rounded">[total]</code> - Order total</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Product Orders:</h4>
              <ul className="space-y-1 text-blue-700">
                <li><code className="bg-blue-100 px-1 rounded">[customerAddress]</code> - Shipping address</li>
                <li><code className="bg-blue-100 px-1 rounded">[itemsList]</code> - Formatted items list</li>
              </ul>
              <h4 className="font-medium text-blue-800 mb-2 mt-3">Repair Services:</h4>
              <ul className="space-y-1 text-blue-700">
                <li><code className="bg-blue-100 px-1 rounded">[itemsList]</code> - Formatted items list</li>
                <li><code className="bg-blue-100 px-1 rounded">[repairQuote]</code> - Repair quote details</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewMode && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Email Preview</h3>
              <button
                onClick={() => setPreviewMode(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Subject:</h4>
                <p className="text-gray-700">{previewData.subject}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Content:</h4>
                <div 
                  className="border border-gray-200 p-4 bg-gray-50 rounded"
                  dangerouslySetInnerHTML={{ __html: previewData.html }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
