import client from './client'

export interface AuthResponse {
  token: string
  tokenType: string
  userId: string
  email: string
  name: string
}

export const login = (email: string, password: string) =>
  client.post<AuthResponse>('/auth/login', { email, password })

export const register = (email: string, password: string, name: string) =>
  client.post<AuthResponse>('/auth/register', { email, password, name })

export const forgotPassword = (email: string) =>
  client.post<{ message: string }>('/auth/forgot-password', { email })

export const resetPassword = (token: string, newPassword: string) =>
  client.post<{ message: string }>('/auth/reset-password', { token, newPassword })
