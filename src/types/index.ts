export interface Customer {
  id: string
  customerId: string
  customerName: string
  displayName: string
  phone: string | null
  createdAt: Date
  updatedAt: Date
  storeOwnerId: string
  currentBalance?: number
  totalTransactions?: number
  lastTransactionDate?: Date
}

export interface Transaction {
  id: string
  amount: number
  type: TransactionType
  notes: string | null
  createdAt: Date
  updatedAt: Date
  customerId: string
  storeOwnerId: string
  customer?: Customer
}

export interface StoreOwner {
  id: string
  email: string
  phone: string | null
  storeName: string | null
  ownerName: string | null
  createdAt: Date
  updatedAt: Date
  totalOutstanding?: number
  totalCustomers?: number
}

export enum TransactionType {
  CREDIT_GIVEN = 'CREDIT_GIVEN',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED'
}

export interface DashboardStats {
  totalOutstanding: number
  totalCustomers: number
  weeklyTransactions: number
}