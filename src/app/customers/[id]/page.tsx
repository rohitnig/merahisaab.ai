'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, MessageCircle, Plus, Minus } from 'lucide-react'
import { Customer, Transaction, TransactionType } from '@/types'
import { formatCurrency, formatDate, createWhatsAppUrl } from '@/lib/utils'
import TransactionCard from '@/components/TransactionCard'
import LoadingSpinner from '@/components/LoadingSpinner'

interface CustomerWithDetails extends Customer {
  currentBalance: number
  totalTransactions: number
  lastTransactionDate: Date
  transactions: Transaction[]
}

export default function CustomerDetail() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const customerId = params.id as string

  const [customer, setCustomer] = useState<CustomerWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id && customerId) {
      fetchCustomerDetails()
    }
  }, [session, customerId])

  const fetchCustomerDetails = async () => {
    try {
      const response = await fetch(`/api/customers/${customerId}`)
      if (!response.ok) {
        if (response.status === 404) {
          setError('Customer not found')
        } else {
          throw new Error('Failed to fetch customer details')
        }
        return
      }
      
      const data = await response.json()
      setCustomer(data.customer)
    } catch (error) {
      console.error('Error fetching customer:', error)
      setError('Failed to load customer details')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickTransaction = (type: TransactionType) => {
    const params = new URLSearchParams({
      customerId: customer?.id || '',
      type
    })
    router.push(`/transactions/add?${params.toString()}`)
  }

  const handleWhatsApp = () => {
    if (!customer?.phone) return
    
    const message = `नमस्ते ${customer.customerName},
आपकी दुकान से संदेश।
आपका वर्तमान बैलेंस: ${formatCurrency(Math.abs(customer.currentBalance))}
${customer.currentBalance > 0 ? '(आपका बकाया)' : customer.currentBalance < 0 ? '(हमारा बकाया)' : '(बैलेंस जीरो)'}
धन्यवाद!`
    
    const whatsappUrl = createWhatsAppUrl(customer.phone, message)
    window.open(whatsappUrl, '_blank')
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link 
            href="/dashboard"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Customer not found</p>
      </div>
    )
  }

  const balanceColor = customer.currentBalance > 0 
    ? 'text-red-600' 
    : customer.currentBalance < 0 
    ? 'text-green-600' 
    : 'text-gray-600'

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
          <h1 className="text-xl font-bold text-gray-900 flex-1">
            Customer Details
          </h1>
        </div>

        {/* Customer Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {customer.displayName}
            </h2>
            
            {customer.phone && (
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">{customer.phone}</span>
              </div>
            )}

            <div className={`text-3xl font-bold mb-2 ${balanceColor}`}>
              {formatCurrency(Math.abs(customer.currentBalance))}
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              {customer.currentBalance > 0 
                ? 'They owe you' 
                : customer.currentBalance < 0 
                ? 'You owe them' 
                : 'All settled'}
            </p>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p className="font-medium">{customer.totalTransactions}</p>
                <p>Total Transactions</p>
              </div>
              <div>
                <p className="font-medium">
                  {formatDate(customer.lastTransactionDate).split(',')[0]}
                </p>
                <p>Last Transaction</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => handleQuickTransaction(TransactionType.CREDIT_GIVEN)}
            className="flex flex-col items-center justify-center p-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Plus className="h-6 w-6 mb-1" />
            <span className="text-sm hindi-text">उधार दें</span>
          </button>
          
          <button
            onClick={() => handleQuickTransaction(TransactionType.PAYMENT_RECEIVED)}
            className="flex flex-col items-center justify-center p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Minus className="h-6 w-6 mb-1" />
            <span className="text-sm hindi-text">पैसा लें</span>
          </button>
          
          {customer.phone && (
            <button
              onClick={handleWhatsApp}
              className="flex flex-col items-center justify-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="h-6 w-6 mb-1" />
              <span className="text-sm">WhatsApp</span>
            </button>
          )}
        </div>

        {/* Transaction History */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Transaction History
          </h3>
          
          {customer.transactions.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg">
              <p className="text-gray-500 mb-4">No transactions yet</p>
              <button
                onClick={() => handleQuickTransaction(TransactionType.CREDIT_GIVEN)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700"
              >
                Add First Transaction
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {customer.transactions.map((transaction) => (
                <TransactionCard 
                  key={transaction.id} 
                  transaction={transaction} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}