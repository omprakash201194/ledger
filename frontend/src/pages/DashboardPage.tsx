import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SectionIntro from '../components/SectionIntro'
import { getNetWorth, type NetWorthSummary } from '../api/dashboard'
import { getAssets } from '../api/assets'
import { getLiabilities } from '../api/liabilities'
import { getInsurancePolicies } from '../api/insurance'
import { getRecurringObligations } from '../api/recurring'
import { getTrustedPersons } from '../api/trustedPersons'
import { getDigitalAccounts } from '../api/digitalAccounts'
import { getWillRecord } from '../api/will'
import { useAuthStore } from '../store/authStore'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

interface SectionCounts {
  assets: number
  liabilities: number
  insurance: number
  recurring: number
  trustedPersons: number
  digitalAccounts: number
  hasWill: boolean
}

const sections = [
  { to: '/assets',          label: 'Assets',           icon: '💰', desc: 'Accounts, FDs, investments',   key: 'assets' },
  { to: '/liabilities',     label: 'Liabilities',      icon: '📉', desc: 'Loans, credit cards',           key: 'liabilities' },
  { to: '/insurance',       label: 'Insurance',        icon: '🛡️', desc: 'Policies & premiums',            key: 'insurance' },
  { to: '/recurring',       label: 'Recurring',        icon: '🔁', desc: 'Auto-debits & SIPs',             key: 'recurring' },
  { to: '/trusted-persons', label: 'Trusted Persons',  icon: '👥', desc: 'Family & advisors',              key: 'trustedPersons' },
  { to: '/digital-accounts',label: 'Digital Accounts', icon: '🔐', desc: 'Online accounts',                key: 'digitalAccounts' },
  { to: '/will',            label: 'Will',             icon: '📜', desc: 'Will & executor',                key: 'hasWill' },
  { to: '/alerts',          label: 'Alerts',           icon: '🔔', desc: 'Due dates & reminders',          key: 'alerts' },
]

export default function DashboardPage() {
  const name = useAuthStore((s) => s.name)
  const [summary, setSummary] = useState<NetWorthSummary | null>(null)
  const [counts, setCounts] = useState<SectionCounts | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getNetWorth(),
      getAssets().catch(() => ({ data: [] })),
      getLiabilities().catch(() => ({ data: [] })),
      getInsurancePolicies().catch(() => ({ data: [] })),
      getRecurringObligations().catch(() => ({ data: [] })),
      getTrustedPersons().catch(() => ({ data: [] })),
      getDigitalAccounts().catch(() => ({ data: [] })),
      getWillRecord().catch(() => null),
    ]).then(([nw, assets, liabs, ins, rec, tp, da, will]) => {
      setSummary(nw.data)
      setCounts({
        assets: assets.data.length,
        liabilities: liabs.data.length,
        insurance: ins.data.length,
        recurring: rec.data.length,
        trustedPersons: tp.data.length,
        digitalAccounts: da.data.length,
        hasWill: !!(will?.data?.hasWill),
      })
    }).finally(() => setLoading(false))
  }, [])

  const isNew = counts !== null
    && counts.assets === 0
    && counts.liabilities === 0
    && counts.insurance === 0
    && counts.trustedPersons === 0

  const getSectionSubtitle = (key: string): string | null => {
    if (!counts) return null
    switch (key) {
      case 'assets':         return counts.assets > 0 ? `${counts.assets} record${counts.assets !== 1 ? 's' : ''}` : null
      case 'liabilities':    return counts.liabilities > 0 ? `${counts.liabilities} record${counts.liabilities !== 1 ? 's' : ''}` : null
      case 'insurance':      return counts.insurance > 0 ? `${counts.insurance} polic${counts.insurance !== 1 ? 'ies' : 'y'}` : null
      case 'recurring':      return counts.recurring > 0 ? `${counts.recurring} obligation${counts.recurring !== 1 ? 's' : ''}` : null
      case 'trustedPersons': return counts.trustedPersons > 0 ? `${counts.trustedPersons} contact${counts.trustedPersons !== 1 ? 's' : ''}` : null
      case 'digitalAccounts':return counts.digitalAccounts > 0 ? `${counts.digitalAccounts} account${counts.digitalAccounts !== 1 ? 's' : ''}` : null
      case 'hasWill':        return counts.hasWill ? 'Will recorded' : null
      case 'alerts':         return summary && summary.unreadAlertCount > 0 ? `${summary.unreadAlertCount} unread` : null
      default: return null
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-1">Welcome, {name}</h1>
      <p className="text-sm text-gray-500 mb-4">Your financial legacy at a glance.</p>
      <SectionIntro note="Your financial life at a glance. The numbers here are a summary of what you've recorded across each section. Update each section periodically — the more current it is, the more useful it becomes for you today and for your family if you cannot act yourself." />

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
              <div className="h-6 bg-gray-200 rounded w-24" />
            </div>
          ))}
        </div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <StatCard label="Total Assets"      value={fmt(summary.totalAssets)}      color="text-green-700" />
            <StatCard label="Total Liabilities" value={fmt(summary.totalLiabilities)} color="text-red-600" />
            <StatCard label="Net Worth"          value={fmt(summary.netWorth)}         color="text-indigo-700" />
            <StatCard
              label="Unread Alerts"
              value={String(summary.unreadAlertCount)}
              color={summary.unreadAlertCount > 0 ? 'text-amber-600' : 'text-gray-500'}
              link="/alerts"
            />
          </div>

          {/* D2: Net worth stacked bar */}
          {(summary.totalAssets > 0 || summary.totalLiabilities > 0) && (
            <div className="mb-6">
              <div className="flex h-2.5 rounded-full overflow-hidden">
                {(() => {
                  const total = summary.totalAssets + summary.totalLiabilities
                  const assetPct = total > 0 ? (summary.totalAssets / total) * 100 : 100
                  return (
                    <>
                      <div className="bg-green-400 transition-all" style={{ width: `${assetPct}%` }} />
                      <div className="bg-red-300 transition-all flex-1" />
                    </>
                  )
                })()}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-green-400" />Assets</span>
                <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-red-300" />Liabilities</span>
              </div>
            </div>
          )}
        </>
      ) : null}

      {/* D1: Onboarding checklist — only for brand-new users */}
      {isNew && !loading && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-indigo-800 mb-2">Get started — build your register</p>
          <ul className="space-y-1.5">
            {[
              { to: '/trusted-persons', label: 'Add trusted persons (spouse, CA, lawyer)' },
              { to: '/assets',          label: 'Record your accounts & investments' },
              { to: '/insurance',       label: 'Add your insurance policies' },
              { to: '/will',            label: 'Document your Will location & executor' },
            ].map(item => (
              <li key={item.to}>
                <Link to={item.to} className="flex items-center gap-2 text-sm text-indigo-700 hover:text-indigo-900">
                  <span className="text-indigo-300">☐</span>
                  <span className="hover:underline">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* B2: Section grid with counts */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Sections</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {sections.map((item) => {
          const subtitle = getSectionSubtitle(item.key)
          return (
            <Link
              key={item.to}
              to={item.to}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-sm font-semibold text-gray-800">{item.label}</div>
              {subtitle ? (
                <div className="text-xs text-indigo-600 font-medium mt-0.5">{subtitle}</div>
              ) : (
                <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
              )}
            </Link>
          )
        })}
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
