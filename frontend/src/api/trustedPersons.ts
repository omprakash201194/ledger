import client from './client'

export type TrustedPersonType = 'FAMILY' | 'ADVISOR' | 'EXECUTOR'

export interface TrustedPerson {
  id: string
  name: string
  relationship?: string
  type: TrustedPersonType
  phone?: string
  email?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type TrustedPersonRequest = Omit<TrustedPerson, 'id' | 'createdAt' | 'updatedAt'>

export const getTrustedPersons = () => client.get<TrustedPerson[]>('/trusted-persons')
export const getTrustedPerson = (id: string) => client.get<TrustedPerson>(`/trusted-persons/${id}`)
export const createTrustedPerson = (data: TrustedPersonRequest) => client.post<TrustedPerson>('/trusted-persons', data)
export const updateTrustedPerson = (id: string, data: TrustedPersonRequest) => client.put<TrustedPerson>(`/trusted-persons/${id}`, data)
export const deleteTrustedPerson = (id: string) => client.delete(`/trusted-persons/${id}`)
