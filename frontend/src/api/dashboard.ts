import client from './client'

export interface NetWorthSummary {
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  unreadAlertCount: number
}

export const getNetWorth = () => client.get<NetWorthSummary>('/dashboard/net-worth')
