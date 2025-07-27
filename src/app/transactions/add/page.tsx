'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { TransactionType } from '@/types'
import { createWhatsAppUrl } from '@/lib/utils'
import LoadingSpinner from '@/components/LoadingSpinner'

interface Customer {
  id: string
  customerId: string
  customerName: string
  displayName: string
  phone: string | null
}

export default function AddTransaction() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [isNewCustomer, setIsNewCustomer] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [amount, setAmount] = useState('')
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.CREDIT_GIVEN)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchCustomers()
    }
  }, [session])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      if (!response.ok) throw new Error('Failed to fetch customers')
      
      const data = await response.json()
      setCustomers(data.customers)
    } catch (error) {
      console.error('Error fetching customers:', error)
      setError('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const handleCustomerChange = (value: string) => {
    if (value === 'new') {
      setIsNewCustomer(true)
      setSelectedCustomer('')
    } else {
      setIsNewCustomer(false)
      setSelectedCustomer(value)
    }
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      setSubmitting(false)
      return
    }

    if (!selectedCustomer && !customerName) {
      setError('Please select a customer or enter a new customer name')
      setSubmitting(false)
      return
    }

    try {
      const requestBody = {
        customerId: selectedCustomer || null,
        customerName: isNewCustomer ? customerName : null,
        phone: isNewCustomer ? phone : null,
        amount: parseFloat(amount),
        type: transactionType,
        notes: notes || null
      }

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create transaction')
      }

      const data = await response.json()
      setSuccess('Transaction created successfully!')

      // Send WhatsApp message if phone number exists
      if (data.customer.phone) {
        const message = `नमस्ते ${data.customer.customerName}, 
आपकी दुकान से संदेश।
${transactionType === TransactionType.CREDIT_GIVEN ? 'उधार दिया' : 'पैसा मिला'}: ₹${amount}
धन्यवाद!`
        
        const whatsappUrl = createWhatsAppUrl(data.customer.phone, message)
        window.open(whatsappUrl, '_blank')
      }

      // Reset form
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (error) {
      console.error('Transaction error:', error)
      setError(error instanceof Error ? error.message : 'Failed to create transaction')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link 
            href="/dashboard"
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 hindi-text">
            नया लेन-देन
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 hindi-text">
              ग्राहक चुनें
            </label>
            <select
              value={selectedCustomer || (isNewCustomer ? 'new' : '')}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">Select Customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.displayName}
                </option>
              ))}
              <option value="new">+ Add New Customer</option>
            </select>
          </div>

          {/* New Customer Fields */}
          {isNewCustomer && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter customer name"
                  required={isNewCustomer}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+91XXXXXXXXXX"
                />
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 hindi-text">
              राशि (₹) *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
              placeholder="Enter amount"
              min="1"
              step="0.01"
              required
            />
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 hindi-text">
              लेन-देन का प्रकार *
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setTransactionType(TransactionType.CREDIT_GIVEN)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  transactionType === TransactionType.CREDIT_GIVEN
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="hindi-text">उधार दिया</span>
              </button>
              <button
                type="button"
                onClick={() => setTransactionType(TransactionType.PAYMENT_RECEIVED)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  transactionType === TransactionType.PAYMENT_RECEIVED
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="hindi-text">पैसा मिला</span>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Additional details"
              rows={3}
            />
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-white py-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving...' : 'Save Transaction'}
          </button>
        </form>
      </div>
    </div>
  )
}