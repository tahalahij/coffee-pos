import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: Date): string {
  // Check if the date is valid
  if (!date || isNaN(date.getTime())) {
    return 'Invalid Date'
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function generateReceiptId(): string {
  return `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
}

export function calculateTax(amount: number, taxRate: number = 0.08): number {
  return amount * taxRate
}

export function calculateDiscount(amount: number, discount: { type: 'percentage' | 'fixed'; value: number }): number {
  if (discount.type === 'percentage') {
    return amount * (discount.value / 100)
  }
  return Math.min(discount.value, amount)
}
