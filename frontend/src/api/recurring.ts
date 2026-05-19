import client from './client'

export type ObligationType =
  | 'LOAN_EMI' | 'SIP' | 'INSURANCE_PREMIUM' | 'SUBSCRIPTION' | 'UTILITY' | 'OTHER'

export type Frequency = 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY'

export type ActionOnDeath = 'CONTINUE' | 'CANCEL' | 'REVIEW'

export interface RecurringObligation {
  id: string
  obligationType: ObligationType
  payee: string
  amount: number
  frequency: Frequency
  dueDay?: number
  paymentSource?: string
  actionOnDeath?: ActionOnDeath
  remarks?: string
  createdAt: string
  updatedAt: string
}

export type RecurringObligationRequest = Omit<RecurringObligation, 'id' | 'createdAt' | 'updatedAt'>

export const getRecurringObligations = () => client.get<RecurringObligation[]>('/recurring')
export const getRecurringObligation = (id: string) => client.get<RecurringObligation>(`/recurring/${id}`)
export const createRecurringObligation = (data: RecurringObligationRequest) => client.post<RecurringObligation>('/recurring', data)
export const updateRecurringObligation = (id: string, data: RecurringObligationRequest) => client.put<RecurringObligation>(`/recurring/${id}`, data)
export const deleteRecurringObligation = (id: string) => client.delete(`/recurring/${id}`)
