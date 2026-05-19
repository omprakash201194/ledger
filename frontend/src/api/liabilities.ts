import client from './client'

export type LiabilityType =
  | 'HOME_LOAN' | 'CAR_LOAN' | 'PERSONAL_LOAN' | 'EDUCATION_LOAN' | 'CREDIT_CARD' | 'OTHER'

export interface Liability {
  id: string
  liabilityType: LiabilityType
  lender: string
  accountNumber?: string
  originalAmount?: number
  outstandingBalance?: number
  emiAmount?: number
  tenureEndDate?: string
  linkedAssetId?: string
  linkedAssetDescription?: string
  remarks?: string
  createdAt: string
  updatedAt: string
}

export type LiabilityRequest = Omit<Liability, 'id' | 'linkedAssetDescription' | 'createdAt' | 'updatedAt'>

export const getLiabilities = () => client.get<Liability[]>('/liabilities')
export const getLiability = (id: string) => client.get<Liability>(`/liabilities/${id}`)
export const createLiability = (data: LiabilityRequest) => client.post<Liability>('/liabilities', data)
export const updateLiability = (id: string, data: LiabilityRequest) => client.put<Liability>(`/liabilities/${id}`, data)
export const deleteLiability = (id: string) => client.delete(`/liabilities/${id}`)
