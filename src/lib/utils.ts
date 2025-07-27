export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function generateCustomerId(name: string, phone?: string): string {
  const nameSlug = name.toLowerCase().replace(/\s+/g, '_')
  const phoneDigits = phone ? phone.slice(-4) : Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  const timestamp = Date.now().toString().slice(-6)
  return `${nameSlug}_${phoneDigits}_${timestamp}`
}

export function createWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^\d]/g, '')
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}

export function getDisplayName(name: string, phone?: string, hasDuplicates?: boolean): string {
  if (hasDuplicates && phone) {
    const lastFour = phone.slice(-4)
    return `${name} (${lastFour})`
  }
  return name
}