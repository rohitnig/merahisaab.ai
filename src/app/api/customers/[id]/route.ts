import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TransactionType } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const customerId = resolvedParams.id
    const storeOwnerId = session.user.id

    // Get customer with transactions
    const customer = await prisma.customer.findUnique({
      where: { 
        id: customerId,
        storeOwnerId // Ensure user can only access their own customers
      },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Calculate balance
    const creditGiven = customer.transactions
      .filter(t => t.type === TransactionType.CREDIT_GIVEN)
      .reduce((sum, t) => sum + t.amount, 0)
    
    const paymentsReceived = customer.transactions
      .filter(t => t.type === TransactionType.PAYMENT_RECEIVED)
      .reduce((sum, t) => sum + t.amount, 0)
    
    const currentBalance = creditGiven - paymentsReceived
    const totalTransactions = customer.transactions.length
    const lastTransactionDate = customer.transactions.length > 0 
      ? customer.transactions[0].createdAt
      : customer.createdAt

    const customerWithBalance = {
      ...customer,
      currentBalance,
      totalTransactions,
      lastTransactionDate
    }

    return NextResponse.json({ customer: customerWithBalance })

  } catch (error) {
    console.error('Customer detail error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}