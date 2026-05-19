import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getNetWorth, type NetWorthSummary } from '../api/dashboard'
import { useAuthStore } from '../store/authStore'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

export default function DashboardPage() {
  const name = useAuthStore((s) => s.name)
  const [summary, setSummary] = useState<NetWorthSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNetWorth()
      .then((r) => setSummary(r.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-1">Welcome, {name}</h1>
      <p className="text-sm text-gray-500 mb-6">Your financial legacy at a glance.</p>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : summary ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Assets" value={fmt(summary.totalAssets)} color="text-green-700" />
          <StatCard label="Total Liabilities" value={fmt(summary.totalLiabilities)} color="text-red-600" />
          <StatCard label="Net Worth" value={fmt(summary.netWorth)} color="text-indigo-700" />
          <StatCard
            label="Unread Alerts"
            value={String(summary.unreadAlertCount)}
            color={summary.unreadAlertCount > 0 ? 'text-amber-600' : 'text-gray-500'}
            link="/alerts"
          />
        </div>
      ) : null}

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Sections</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { to: '/assets', label: 'Assets', icon: '💰', desc: 'Accounts, FDs, investments' },
          { to: '/liabilities', label: 'Liabilities', icon: '📉', desc: 'Loans, credit cards' },
          { to: '/insurance', label: 'Insurance', icon: '🛡️', desc: 'Policies & premiums' },
          { to: '/recurring', label: 'Recurring', icon: '🔁', desc: 'Auto-debits & SIPs' },
          { to: '/trusted-persons', label: 'Trusted Persons', icon: '👥', desc: 'Family & advisors' },
          { to: '/digital-accounts', label: 'Digital Accounts', icon: '🔐', desc: 'Online accounts' },
          { to: '/will', label: 'Will', icon: '📜', desc: 'Will & executor' },
          { to: '/alerts', label: 'Alerts', icon: '🔔', desc: 'Due dates & reminders' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className="text-sm font-semibold text-gray-800">{item.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, color, link }: { label: string; value: string; color: string; link?: string }) {
  const content = (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  )
  return link ? <Link to={link}>{content}</Link> : content
}
