import client from './client'

export type AlertType =
  | 'INSURANCE_PREMIUM_DUE' | 'EMI_DUE' | 'WILL_REVIEW_DUE'
  | 'OBLIGATION_REVIEW' | 'ASSET_VALUE_STALE'

export interface Alert {
  id: string
  alertType: AlertType
  title: string
  message: string
  sourceEntity?: string
  dueDate?: string
  isRead: boolean
  createdAt: string
}

export const getAlerts = () => client.get<Alert[]>('/alerts')
export const markAlertRead = (id: string) => client.patch(`/alerts/${id}/read`)
export const markAllAlertsRead = () => client.patch('/alerts/read-all')
