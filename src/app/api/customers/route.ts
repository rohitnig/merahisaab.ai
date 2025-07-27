import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const storeOwnerId = session.user.id

    const customers = await prisma.customer.findMany({
      where: { storeOwnerId },
      select: {
        id: true,
        customerId: true,
        customerName: true,
        displayName: true,
        phone: true
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({ customers })

  } catch (error) {
    console.error('Customers fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}