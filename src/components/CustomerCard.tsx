import Link from 'next/link'
import { Customer } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Phone } from 'lucide-react'

interface CustomerCardProps {
  customer: Customer & {
    currentBalance: number
    totalTransactions: number
    lastTransactionDate: Date
  }
}

export default function CustomerCard({ customer }: CustomerCardProps) {
  const balanceColor = customer.currentBalance > 0 
    ? 'text-red-600' 
    : customer.currentBalance < 0 
    ? 'text-green-600' 
    : 'text-gray-600'

  return (
    <Link 
      href={`/customers/${customer.id}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{customer.displayName}</h3>
            {customer.phone && (
              <Phone className="h-4 w-4 text-gray-400" />
            )}
          </div>
          
          {customer.phone && (
            <p className="text-sm text-gray-600 mt-1">{customer.phone}</p>
          )}
          
          <p className="text-xs text-gray-500 mt-1">
            {customer.totalTransactions} transaction{customer.totalTransactions !== 1 ? 's' : ''} • 
            Last: {formatDate(customer.lastTransactionDate)}
          </p>
        </div>
        
        <div className="text-right">
          <p className={`font-bold text-lg ${balanceColor}`}>
            {formatCurrency(Math.abs(customer.currentBalance))}
          </p>
          <p className="text-xs text-gray-500">
            {customer.currentBalance > 0 ? 'They owe' : customer.currentBalance < 0 ? 'You owe' : 'Settled'}
          </p>
        </div>
      </div>
    </Link>
  )
}