import { create } from 'zustand'

interface ToastState {
  message: string | null
  type: 'success' | 'error'
  show: (message: string, type?: 'success' | 'error') => void
  dismiss: () => void
  _timer: ReturnType<typeof setTimeout> | null
}

export const useToastStore = create<ToastState>((set, get) => ({
  message: null,
  type: 'success',
  _timer: null,
  show: (message, type = 'success') => {
    const prev = get()._timer
    if (prev) clearTimeout(prev)
    const timer = setTimeout(() => set({ message: null, _timer: null }), 3000)
    set({ message, type, _timer: timer })
  },
  dismiss: () => {
    const prev = get()._timer
    if (prev) clearTimeout(prev)
    set({ message: null, _timer: null })
  },
}))
