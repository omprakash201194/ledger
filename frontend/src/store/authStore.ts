import { create } from 'zustand'

interface AuthState {
  token: string | null
  userId: string | null
  email: string | null
  name: string | null
  isAuthenticated: boolean
  login: (token: string, userId: string, email: string, name: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('ledger_token'),
  userId: localStorage.getItem('ledger_userId'),
  email: localStorage.getItem('ledger_email'),
  name: localStorage.getItem('ledger_name'),
  isAuthenticated: !!localStorage.getItem('ledger_token'),

  login: (token, userId, email, name) => {
    localStorage.setItem('ledger_token', token)
    localStorage.setItem('ledger_userId', userId)
    localStorage.setItem('ledger_email', email)
    localStorage.setItem('ledger_name', name)
    set({ token, userId, email, name, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('ledger_token')
    localStorage.removeItem('ledger_userId')
    localStorage.removeItem('ledger_email')
    localStorage.removeItem('ledger_name')
    set({ token: null, userId: null, email: null, name: null, isAuthenticated: false })
  },
}))
