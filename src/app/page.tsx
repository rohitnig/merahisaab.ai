'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md w-full">
        <h1 className="text-4xl font-bold text-primary mb-2">
          MeraHisaab.ai
        </h1>
        <p className="text-gray-600 hindi-text text-lg mb-8">
          आपका डिजिटल बही खाता
        </p>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <p className="text-gray-800 mb-4">
            Digital ledger for Indian Kirana store owners
          </p>
          <p className="text-sm text-gray-600">
            Replace your physical bahi khata with this modern digital solution
          </p>
        </div>
        <Link 
          href="/auth/signin"
          className="block w-full bg-primary text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Get Started
        </Link>
      </div>
    </main>
  )
}