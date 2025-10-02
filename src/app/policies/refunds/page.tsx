import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function RefundsPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation cartCount={0} />
      
      <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold">Refund Policy</h1>
          </div>
        </div>
      </div>
      
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Return & Refund Information</h2>
              <p className="text-gray-700 mb-6">
                We want you to be completely satisfied with your purchase. Please review our refund policy below.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Return Window</h3>
              <p className="text-gray-700 mb-6">
                Returns are accepted within 30 days of delivery. Items must be in original condition with all original packaging and accessories included.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Eligible Items</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>New, unused products in original packaging</li>
                <li>Products that are defective or damaged upon arrival</li>
                <li>Products that don't match the description on our website</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Non-Refundable Items</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Mail-in repair services (once diagnosis has begun)</li>
                <li>Custom or personalized items</li>
                <li>Items damaged by misuse or normal wear and tear</li>
                <li>Items returned after 30 days</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Return Process</h3>
              <ol className="list-decimal list-inside text-gray-700 mb-6 space-y-2">
                <li>Contact us to initiate a return within 30 days of delivery</li>
                <li>We will provide you with a return authorization number</li>
                <li>Package the item securely in its original packaging</li>
                <li>Ship the item back to us using a trackable shipping method</li>
                <li>Once received, we will inspect the item and process your refund</li>
              </ol>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Refund Timeline</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Refunds are processed within 5-7 business days of receiving the returned item</li>
                <li>Credit card refunds may take 1-2 billing cycles to appear on your statement</li>
                <li>Refunds will be issued to the original payment method used for the purchase</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Return Shipping</h3>
              <p className="text-gray-700 mb-4">
                Return shipping costs are the responsibility of the customer unless the item is defective or we made an error.
              </p>
              <p className="text-gray-700 mb-6">
                We recommend using a trackable shipping method and keeping your receipt until the return is processed.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Mail-In Service Refunds</h3>
              <p className="text-gray-700 mb-4">
                The mail-in service fee is non-refundable once diagnosis has begun. However, if we determine that your device cannot be repaired, we will refund the service fee.
              </p>
              <p className="text-gray-700 mb-6">
                If you decide not to proceed with recommended repairs after receiving an estimate, the service fee is non-refundable.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Contact Information</h3>
              <p className="text-gray-700 mb-4">
                To initiate a return or if you have questions about our refund policy, please contact us:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Email: returns@jbinverters.com</li>
                <li>Phone: (555) 123-4567</li>
                <li>Include your order number and reason for return</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}
