import { Transaction, TransactionType } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowDown, ArrowUp } from 'lucide-react'

interface TransactionCardProps {
  transaction: Transaction
}

export default function TransactionCard({ transaction }: TransactionCardProps) {
  const isCredit = transaction.type === TransactionType.CREDIT_GIVEN
  const iconColor = isCredit ? 'text-red-600' : 'text-green-600'
  const bgColor = isCredit ? 'bg-red-50' : 'bg-green-50'
  const borderColor = isCredit ? 'border-red-200' : 'border-green-200'

  return (
    <div className={`p-4 rounded-lg border ${bgColor} ${borderColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${bgColor}`}>
            {isCredit ? (
              <ArrowUp className={`h-4 w-4 ${iconColor}`} />
            ) : (
              <ArrowDown className={`h-4 w-4 ${iconColor}`} />
            )}
          </div>
          <div>
            <p className={`font-semibold ${iconColor} hindi-text`}>
              {isCredit ? 'उधार दिया' : 'पैसा मिला'}
            </p>
            <p className="text-sm text-gray-600">
              {formatDate(transaction.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className={`text-lg font-bold ${iconColor}`}>
            {formatCurrency(transaction.amount)}
          </p>
        </div>
      </div>
      
      {transaction.notes && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-sm text-gray-600">{transaction.notes}</p>
        </div>
      )}
    </div>
  )
}