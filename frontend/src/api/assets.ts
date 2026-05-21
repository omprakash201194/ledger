import client from './client'

export type AssetType =
  | 'SAVINGS_ACCOUNT' | 'CURRENT_ACCOUNT'
  | 'FIXED_DEPOSIT' | 'RECURRING_DEPOSIT'
  | 'PPF' | 'EPF' | 'NPS'
  | 'MUTUAL_FUND' | 'EQUITY'
  | 'GOLD' | 'REAL_ESTATE' | 'VEHICLE' | 'BANK_LOCKER'
  | 'OTHER'

export type HoldingMode = 'SINGLE' | 'JOINT' | 'EITHER_OR_SURVIVOR'

export interface Asset {
  id: string
  assetType: AssetType
  description: string
  institution?: string
  accountNumber?: string
  holdingMode: HoldingMode
  jointHolderName?: string
  trustedPersonId?: string
  trustedPersonName?: string
  approxValue?: number
  valueAsOf?: string
  maturityDate?: string
  documentLocation?: string
  remarks?: string
  createdAt: string
  updatedAt: string
}

export type AssetRequest = Omit<Asset, 'id' | 'trustedPersonName' | 'createdAt' | 'updatedAt'>

export const getAssets = () => client.get<Asset[]>('/assets')
export const getAsset = (id: string) => client.get<Asset>(`/assets/${id}`)
export const createAsset = (data: AssetRequest) => client.post<Asset>('/assets', data)
export const updateAsset = (id: string, data: AssetRequest) => client.put<Asset>(`/assets/${id}`, data)
export const deleteAsset = (id: string) => client.delete(`/assets/${id}`)
