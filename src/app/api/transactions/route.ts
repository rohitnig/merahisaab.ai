import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TransactionType } from '@/types'
import { generateCustomerId, getDisplayName } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { customerId, customerName, phone, amount, type, notes } = body

    // Validate required fields
    if (!amount || !type || (!customerId && !customerName)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }

    const storeOwnerId = session.user.id
    let customer

    if (customerId) {
      // Existing customer
      customer = await prisma.customer.findUnique({
        where: { id: customerId }
      })
      
      if (!customer || customer.storeOwnerId !== storeOwnerId) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }
    } else {
      // New customer
      if (!customerName) {
        return NextResponse.json({ error: 'Customer name is required for new customers' }, { status: 400 })
      }

      // Check for duplicate names to generate display name
      const duplicateCount = await prisma.customer.count({
        where: {
          customerName,
          storeOwnerId
        }
      })

      const displayName = getDisplayName(customerName, phone, duplicateCount > 0)
      const generatedCustomerId = generateCustomerId(customerName, phone)

      customer = await prisma.customer.create({
        data: {
          customerId: generatedCustomerId,
          customerName,
          displayName,
          phone: phone || null,
          storeOwnerId
        }
      })
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type: type as TransactionType,
        notes: notes || null,
        customerId: customer.id,
        storeOwnerId
      },
      include: {
        customer: true
      }
    })

    return NextResponse.json({
      transaction,
      customer,
      message: 'Transaction created successfully'
    })

  } catch (error) {
    console.error('Transaction creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const storeOwnerId = session.user.id

    const transactions = await prisma.transaction.findMany({
      where: { storeOwnerId },
      include: {
        customer: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 transactions
    })

    return NextResponse.json({ transactions })

  } catch (error) {
    console.error('Transactions fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}