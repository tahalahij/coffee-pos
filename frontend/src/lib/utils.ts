import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fa-IR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' تومان'
}

export function formatDate(date: string | number | Date): string {
  let d: Date;
  if (date instanceof Date) {
    d = date;
  } else {
    d = new Date(date);
  }
  if (!d || isNaN(d.getTime())) {
    return 'تاریخ نامعتبر';
  }
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
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

// Convert Persian/Arabic digits to English digits
export function toEnglishDigits(str: string): string {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹'
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩'
  
  return str
    .split('')
    .map(char => {
      const persianIndex = persianDigits.indexOf(char)
      if (persianIndex !== -1) return persianIndex.toString()
      
      const arabicIndex = arabicDigits.indexOf(char)
      if (arabicIndex !== -1) return arabicIndex.toString()
      
      return char
    })
    .join('')
}
