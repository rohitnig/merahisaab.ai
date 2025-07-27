import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TransactionType } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const storeOwnerId = session.user.id

    // Get customers with computed balances
    const customers = await prisma.customer.findMany({
      where: { storeOwnerId },
      include: {
        transactions: true
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Calculate stats and balances
    const customersWithBalances = customers.map(customer => {
      const creditGiven = customer.transactions
        .filter(t => t.type === TransactionType.CREDIT_GIVEN)
        .reduce((sum, t) => sum + t.amount, 0)
      
      const paymentsReceived = customer.transactions
        .filter(t => t.type === TransactionType.PAYMENT_RECEIVED)
        .reduce((sum, t) => sum + t.amount, 0)
      
      const currentBalance = creditGiven - paymentsReceived
      const totalTransactions = customer.transactions.length
      const lastTransactionDate = customer.transactions.length > 0 
        ? customer.transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt
        : customer.createdAt

      return {
        ...customer,
        currentBalance,
        totalTransactions,
        lastTransactionDate,
        transactions: undefined // Remove transactions from response to reduce payload
      }
    })

    // Calculate dashboard stats
    const totalOutstanding = customersWithBalances
      .filter(c => c.currentBalance > 0)
      .reduce((sum, c) => sum + c.currentBalance, 0)
    
    const totalCustomers = customers.length

    // Get weekly transactions count
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const weeklyTransactions = await prisma.transaction.count({
      where: {
        storeOwnerId,
        createdAt: { gte: weekAgo }
      }
    })

    const stats = {
      totalOutstanding,
      totalCustomers,
      weeklyTransactions
    }

    // Sort customers by balance (highest debt first)
    const sortedCustomers = customersWithBalances.sort((a, b) => b.currentBalance - a.currentBalance)

    return NextResponse.json({
      stats,
      customers: sortedCustomers
    })

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}