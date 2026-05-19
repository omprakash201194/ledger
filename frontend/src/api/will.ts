import client from './client'

export type WillType = 'SINGLE' | 'JOINT' | 'NONE'

export interface WillRecord {
  id: string
  hasWill: boolean
  willType?: WillType
  location?: string
  executorId?: string
  executorName?: string
  registeredWith?: string
  reviewReminderDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type WillRecordRequest = Omit<WillRecord, 'id' | 'executorName' | 'createdAt' | 'updatedAt'>

export const getWillRecord = () => client.get<WillRecord>('/will')
export const upsertWillRecord = (data: WillRecordRequest) => client.put<WillRecord>('/will', data)
