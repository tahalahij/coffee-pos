import { toast as hotToast, ToastOptions } from 'react-hot-toast'

export type ToastVariant = 'default' | 'destructive' | 'success'

export interface ToastPayload {
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

export function useToast() {
  const toast = ({ title, description, variant = 'default', duration }: ToastPayload) => {
    const message = [title, description].filter(Boolean).join(' - ')
    const options: ToastOptions = {}

    if (duration) {
      options.duration = duration
    }

    if (variant === 'destructive') {
      hotToast.error(message || 'An unexpected error occurred', options)
      return
    }

    if (variant === 'success') {
      hotToast.success(message || 'Success', options)
      return
    }

    hotToast(message || 'Notification', options)
  }

  return { toast }
}
