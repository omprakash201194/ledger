import client from './client'

export type PolicyType =
  | 'TERM_LIFE' | 'WHOLE_LIFE' | 'HEALTH' | 'VEHICLE' | 'PROPERTY' | 'OTHER'

export interface InsurancePolicy {
  id: string
  policyType: PolicyType
  insurer: string
  policyNumber?: string
  lifeAssured?: string
  sumAssured?: number
  premiumAmount?: number
  premiumDueMonth?: number
  premiumDueDay?: number
  trustedPersonId?: string
  trustedPersonName?: string
  maturityDate?: string
  documentLocation?: string
  remarks?: string
  createdAt: string
  updatedAt: string
}

export type InsurancePolicyRequest = Omit<InsurancePolicy, 'id' | 'trustedPersonName' | 'createdAt' | 'updatedAt'>

export const getInsurancePolicies = () => client.get<InsurancePolicy[]>('/insurance')
export const getInsurancePolicy = (id: string) => client.get<InsurancePolicy>(`/insurance/${id}`)
export const createInsurancePolicy = (data: InsurancePolicyRequest) => client.post<InsurancePolicy>('/insurance', data)
export const updateInsurancePolicy = (id: string, data: InsurancePolicyRequest) => client.put<InsurancePolicy>(`/insurance/${id}`, data)
export const deleteInsurancePolicy = (id: string) => client.delete(`/insurance/${id}`)
