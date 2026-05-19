import { useEffect, useState } from 'react'
import { getAlerts, markAlertRead, markAllAlertsRead, type Alert, type AlertType } from '../api/alerts'

const typeLabel: Record<AlertType, string> = {
  INSURANCE_PREMIUM_DUE: 'Premium Due',
  EMI_DUE: 'EMI Due',
  WILL_REVIEW_DUE: 'Will Review',
  OBLIGATION_REVIEW: 'Obligation',
  ASSET_VALUE_STALE: 'Stale Value',
}

const typeColor: Record<AlertType, string> = {
  INSURANCE_PREMIUM_DUE: 'bg-orange-100 text-orange-700',
  EMI_DUE: 'bg-red-100 text-red-700',
  WILL_REVIEW_DUE: 'bg-purple-100 text-purple-700',
  OBLIGATION_REVIEW: 'bg-amber-100 text-amber-700',
  ASSET_VALUE_STALE: 'bg-blue-100 text-blue-700',
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState<string | null>(null)
  const [markingAll, setMarkingAll] = useState(false)

  const load = () => getAlerts().then(r => { setAlerts(r.data); setLoading(false) })
  useEffect(() => { load() }, [])

  const unreadCount = alerts.filter(a => !a.isRead).length

  const handleMarkRead = async (id: string) => {
    setMarking(id)
    await markAlertRead(id)
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a))
    setMarking(null)
  }

  const handleMarkAllRead = async () => {
    setMarkingAll(true)
    await markAllAlertsRead()
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })))
    setMarkingAll(false)
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Alerts</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {unreadCount > 0 ? <span className="font-medium text-orange-600">{unreadCount} unread</span> : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="text-sm text-indigo-600 hover:underline disabled:opacity-50"
          >
            {markingAll ? 'Marking…' : 'Mark all read'}
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : alerts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔔</p>
          <p className="text-sm">No alerts. The nightly scanner will generate alerts when action is needed.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(a => (
            <div
              key={a.id}
              className={`bg-white rounded-xl border px-4 py-3 flex items-start justify-between gap-3 transition-opacity ${
                a.isRead ? 'opacity-50 border-gray-100' : 'border-gray-200'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {!a.isRead && <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[a.alertType]}`}>
                    {typeLabel[a.alertType]}
                  </span>
                  {a.dueDate && <span className="text-xs text-gray-400">Due: {a.dueDate}</span>}
                </div>
                <p className="text-sm font-medium text-gray-800 mt-1">{a.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{a.message}</p>
                <p className="text-xs text-gray-300 mt-1">{new Date(a.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
              {!a.isRead && (
                <button
                  onClick={() => handleMarkRead(a.id)}
                  disabled={marking === a.id}
                  className="shrink-0 text-xs text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  {marking === a.id ? '…' : '✓'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
