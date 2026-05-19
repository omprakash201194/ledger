import client from './client'

export type DigitalAccountCategory =
  | 'PASSWORD_MANAGER' | 'EMAIL' | 'BANKING' | 'INVESTMENT'
  | 'SOCIAL_MEDIA' | 'GOVERNMENT' | 'SUBSCRIPTION' | 'OTHER'

export type ActionOnDeath = 'TRANSFER' | 'ARCHIVE' | 'CLOSE' | 'MEMORIALIZE'

export interface DigitalAccount {
  id: string
  category: DigitalAccountCategory
  serviceName: string
  username?: string
  credentialLocation?: string
  twoFaMethod?: string
  recoveryContact?: string
  actionOnDeath?: ActionOnDeath
  remarks?: string
  createdAt: string
  updatedAt: string
}

export type DigitalAccountRequest = Omit<DigitalAccount, 'id' | 'createdAt' | 'updatedAt'>

export const getDigitalAccounts = () => client.get<DigitalAccount[]>('/digital-accounts')
export const getDigitalAccount = (id: string) => client.get<DigitalAccount>(`/digital-accounts/${id}`)
export const createDigitalAccount = (data: DigitalAccountRequest) => client.post<DigitalAccount>('/digital-accounts', data)
export const updateDigitalAccount = (id: string, data: DigitalAccountRequest) => client.put<DigitalAccount>(`/digital-accounts/${id}`, data)
export const deleteDigitalAccount = (id: string) => client.delete(`/digital-accounts/${id}`)
