import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation cartCount={0} />
      
      <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold">Shipping Policy</h1>
          </div>
        </div>
      </div>
      
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Shipping Information</h2>
              <p className="text-gray-700 mb-6">
                We strive to process and ship all orders as quickly as possible. Please review our shipping policy below.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Processing Time</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Orders are typically processed within 1-2 business days</li>
                <li>During peak seasons, processing may take up to 3-5 business days</li>
                <li>Mail-in service orders are processed within 2-3 business days of receipt</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Shipping Methods</h3>
              <div className="space-y-4 mb-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900">Standard Shipping</h4>
                  <p className="text-gray-700">5-7 business days - $9.99</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900">Expedited Shipping</h4>
                  <p className="text-gray-700">2-3 business days - $19.99</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900">Overnight Shipping</h4>
                  <p className="text-gray-700">Next business day - $39.99</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Shipping Areas</h3>
              <p className="text-gray-700 mb-6">
                We currently ship to all 50 US states. International shipping is not available at this time.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Order Tracking</h3>
              <p className="text-gray-700 mb-6">
                Once your order ships, you will receive a tracking number via email. You can use this number to track your package on the carrier's website.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Shipping Address</h3>
              <p className="text-gray-700 mb-4">
                Please ensure your shipping address is correct before placing your order. We are not responsible for packages delivered to incorrect addresses.
              </p>
              <p className="text-gray-700 mb-6">
                If you need to change your shipping address after placing an order, please contact us immediately. Changes may not be possible if the order has already been processed.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Damaged or Lost Packages</h3>
              <p className="text-gray-700 mb-4">
                If your package arrives damaged or is lost in transit, please contact us within 48 hours of delivery (or expected delivery date).
              </p>
              <p className="text-gray-700 mb-6">
                We will work with you to resolve the issue, which may include sending a replacement or issuing a refund.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Free Shipping</h3>
              <p className="text-gray-700">
                Free standard shipping is available on orders over $200. This offer applies to standard shipping only and cannot be combined with other shipping promotions.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}
