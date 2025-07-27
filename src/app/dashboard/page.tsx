'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Search, Users, TrendingUp, Calendar } from 'lucide-react'
import { Customer, DashboardStats } from '@/types'
import { formatCurrency } from '@/lib/utils'
import CustomerCard from '@/components/CustomerCard'
import LoadingSpinner from '@/components/LoadingSpinner'

interface DashboardData {
  stats: DashboardStats
  customers: (Customer & {
    currentBalance: number
    totalTransactions: number
    lastTransactionDate: Date
  })[]
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      const dashboardData = await response.json()
      setData(dashboardData)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = data?.customers.filter(customer =>
    customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  ) || []

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
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary mb-1">
            MeraHisaab.ai
          </h1>
          <p className="text-gray-600 hindi-text">
            आपका डिजिटल बही खाता
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <TrendingUp className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <p className="text-xl font-bold text-red-600">
              {data?.stats ? formatCurrency(data.stats.totalOutstanding) : '₹0'}
            </p>
            <p className="text-xs text-gray-600 hindi-text">कुल बकाया</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <Users className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-xl font-bold text-primary">
              {data?.stats?.totalCustomers || 0}
            </p>
            <p className="text-xs text-gray-600">Customers</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <Calendar className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-xl font-bold text-green-600">
              {data?.stats?.weeklyTransactions || 0}
            </p>
            <p className="text-xs text-gray-600">This Week</p>
          </div>
        </div>

        {/* Add Transaction Button */}
        <Link 
          href="/transactions/add"
          className="block w-full bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-4 rounded-lg font-semibold mb-6 shadow-md hover:from-green-600 hover:to-green-700 transition-all"
        >
          <Plus className="inline h-5 w-5 mr-2" />
          <span className="hindi-text">+ नया लेन-देन जोड़ें</span>
        </Link>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="ग्राहक खोजें..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Customer List */}
        <div className="space-y-3">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? 'No customers found' : 'No customers yet'}
              </p>
              {!searchTerm && (
                <Link 
                  href="/transactions/add"
                  className="text-primary hover:underline mt-2 inline-block"
                >
                  Add your first transaction
                </Link>
              )}
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}