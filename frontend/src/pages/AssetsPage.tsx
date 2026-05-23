import { useEffect, useMemo, useState } from 'react'
import SectionIntro from '../components/SectionIntro'
import {
  getAssets, createAsset, updateAsset, deleteAsset,
  type Asset, type AssetRequest, type AssetType, type HoldingMode,
} from '../api/assets'
import { getTrustedPersons, type TrustedPerson } from '../api/trustedPersons'
import { getAlerts } from '../api/alerts'
import Modal from '../components/Modal'
import SkeletonCard from '../components/SkeletonCard'
import { FormField, inputCls, selectCls } from '../components/FormField'
import { useToastStore } from '../store/toastStore'
import { timeAgo } from '../utils/timeAgo'

const ASSET_TYPE_GROUPS: { label: string; types: AssetType[] }[] = [
  { label: 'Bank & Deposits',       types: ['SAVINGS_ACCOUNT', 'CURRENT_ACCOUNT', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT'] },
  { label: 'Retirement & Savings',  types: ['PPF', 'EPF', 'NPS'] },
  { label: 'Investments',           types: ['MUTUAL_FUND', 'EQUITY'] },
  { label: 'Physical Assets',       types: ['GOLD', 'REAL_ESTATE', 'VEHICLE', 'BANK_LOCKER'] },
  { label: 'Other',                 types: ['OTHER'] },
]

const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  SAVINGS_ACCOUNT:   'Savings Account',
  CURRENT_ACCOUNT:   'Current Account',
  FIXED_DEPOSIT:     'Fixed Deposit',
  RECURRING_DEPOSIT: 'Recurring Deposit',
  PPF: 'PPF', EPF: 'EPF', NPS: 'NPS',
  MUTUAL_FUND: 'Mutual Fund',
  EQUITY: 'Equity / Stocks',
  GOLD: 'Gold', REAL_ESTATE: 'Real Estate', VEHICLE: 'Vehicle', BANK_LOCKER: 'Bank Locker',
  OTHER: 'Other',
}

const MATURITY_TYPES: AssetType[] = ['FIXED_DEPOSIT', 'RECURRING_DEPOSIT', 'NPS']
const HOLDING_MODES: HoldingMode[] = ['SINGLE', 'JOINT', 'EITHER_OR_SURVIVOR']

const fmt = (n?: number) =>
  n != null ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n) : '—'


const blank: AssetRequest = { assetType: 'SAVINGS_ACCOUNT', description: '', holdingMode: 'SINGLE' }

type SortBy = 'value' | 'name' | 'date'

export default function AssetsPage() {
  const toast = useToastStore()
  const [assets, setAssets] = useState<Asset[]>([])
  const [trustedPersons, setTrustedPersons] = useState<TrustedPerson[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Asset | null>(null)
  const [form, setForm] = useState<AssetRequest>(blank)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  const [formDirty, setFormDirty] = useState(false)
  const [showMoreFields, setShowMoreFields] = useState(false)
  const [nomineeMissingMsg, setNomineeMissingMsg] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortBy>('value')
  const [filterGroup, setFilterGroup] = useState<string | null>(null)

  const load = () =>
    Promise.all([
      getAssets(),
      getTrustedPersons(),
      getAlerts().catch(() => ({ data: [] })),
    ]).then(([a, tp, alerts]) => {
      setAssets(a.data)
      setTrustedPersons(tp.data)
      // A4: check for NOMINEE_MISSING unread alert
      const nm = alerts.data.find(al => al.alertType === 'NOMINEE_MISSING' && !al.isRead)
      setNomineeMissingMsg(nm ? nm.title : null)
      setLoading(false)
    })

  useEffect(() => { load() }, [])

  const total = assets.reduce((s, a) => s + (a.approxValue ?? 0), 0)

  const openAdd = () => {
    setEditing(null); setForm(blank); setFormDirty(false); setShowMoreFields(false); setShowModal(true)
  }
  const openEdit = (a: Asset) => {
    setEditing(a)
    const hasOptional = !!(a.accountNumber || a.jointHolderName || a.trustedPersonId || a.valueAsOf || a.maturityDate || a.documentLocation || a.remarks)
    setShowMoreFields(hasOptional)
    setForm({
      assetType: a.assetType, description: a.description, holdingMode: a.holdingMode,
      institution: a.institution, accountNumber: a.accountNumber,
      jointHolderName: a.jointHolderName, trustedPersonId: a.trustedPersonId,
      approxValue: a.approxValue, valueAsOf: a.valueAsOf,
      maturityDate: a.maturityDate,
      documentLocation: a.documentLocation, remarks: a.remarks,
    })
    setFormDirty(false)
    setShowModal(true)
  }

  const tryClose = () => {
    if (formDirty) { setShowDiscardConfirm(true) } else { setShowModal(false) }
  }

  const save = async () => {
    setSaving(true)
    try {
      if (editing) { await updateAsset(editing.id, form); toast.show(`"${form.description}" updated`) }
      else { await createAsset(form); toast.show(`"${form.description}" added`) }
      setShowModal(false)
      load()
    } catch { toast.show('Save failed — please try again', 'error') }
    finally { setSaving(false) }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    await deleteAsset(deleteId)
    setDeleteId(null)
    toast.show('Asset deleted')
    load()
  }

  const set = (k: keyof AssetRequest, v: string | number | undefined) => {
    setForm(f => ({ ...f, [k]: v === '' ? undefined : v }))
    setFormDirty(true)
  }

  // E1: group assets by ASSET_TYPE_GROUPS category
  const grouped = useMemo(() => {
    let list = [...assets]
    if (filterGroup) list = list.filter(a => ASSET_TYPE_GROUPS.find(g => g.label === filterGroup)?.types.includes(a.assetType))
    list.sort((a, b) => {
      if (sortBy === 'value') return (b.approxValue ?? 0) - (a.approxValue ?? 0)
      if (sortBy === 'name') return a.description.localeCompare(b.description)
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
    return ASSET_TYPE_GROUPS.map(g => ({
      label: g.label,
      items: list.filter(a => g.types.includes(a.assetType)),
      subtotal: list.filter(a => g.types.includes(a.assetType)).reduce((s, a) => s + (a.approxValue ?? 0), 0),
    })).filter(g => g.items.length > 0)
  }, [assets, sortBy, filterGroup])

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">Assets</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-0.5">Total: <span className="font-semibold text-green-600">{fmt(total)}</span></p>
        </div>
        <button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          + Add asset
        </button>
      </div>

      <SectionIntro sectionKey="assets" note="Everything you own that has financial value — bank accounts, deposits, mutual funds, demat holdings, property, gold, vehicles. If something can be inherited or claimed, it belongs here. Tip: include even small accounts. Forgotten accounts are the single biggest source of family stress later." />

      {/* A4: NOMINEE_MISSING contextual banner */}
      {nomineeMissingMsg && (
        <div className="mb-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <span className="text-amber-500 mt-0.5 shrink-0">⚠</span>
          <p className="text-xs text-amber-700">{nomineeMissingMsg} — add a nominee when editing each asset.</p>
        </div>
      )}

      {/* E2: Sort + filter row */}
      {!loading && assets.length > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs text-gray-400 dark:text-gray-500">Sort:</span>
          {(['value', 'name', 'date'] as SortBy[]).map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              className={`text-xs px-2 py-1 rounded-full border transition-colors ${sortBy === s ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:border-indigo-300'}`}>
              {s === 'value' ? 'Value ↓' : s === 'name' ? 'Name' : 'Recent'}
            </button>
          ))}
          <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">Filter:</span>
          {ASSET_TYPE_GROUPS.map(g => {
            const hasItems = assets.some(a => g.types.includes(a.assetType))
            if (!hasItems) return null
            return (
              <button key={g.label} onClick={() => setFilterGroup(filterGroup === g.label ? null : g.label)}
                className={`text-xs px-2 py-1 rounded-full border transition-colors ${filterGroup === g.label ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:border-indigo-300'}`}>
                {g.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Asset list */}
      {loading ? (
        <SkeletonCard rows={3} />
      ) : assets.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <p className="text-4xl mb-3">🏦</p>
          <p className="text-sm mb-3">No assets yet. Add your first asset to get started.</p>
          <button onClick={openAdd} className="text-sm text-indigo-600 border border-indigo-200 px-4 py-1.5 rounded-lg hover:bg-indigo-50">
            + Add your first asset
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(group => (
            <div key={group.label}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">{group.label}</h2>
                {group.subtotal > 0 && (
                  <span className="text-xs font-medium text-green-600">{fmt(group.subtotal)}</span>
                )}
              </div>
              <div className="space-y-2">
                {group.items.map(a => (
                  <div key={a.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-800 dark:text-gray-200">{a.description}</span>
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 dark:text-gray-500 px-2 py-0.5 rounded-full">
                          {ASSET_TYPE_LABELS[a.assetType] ?? a.assetType.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex gap-4 mt-1 flex-wrap">
                        {a.institution && <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{a.institution}</span>}
                        {a.accountNumber && <span className="text-xs text-gray-400 dark:text-gray-500">Acct: {a.accountNumber}</span>}
                        <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{a.holdingMode.replace(/_/g, ' ')}</span>
                        {a.trustedPersonName && <span className="text-xs text-blue-600">Nominee: {a.trustedPersonName}</span>}
                      </div>
                      <div className="mt-1 flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-semibold text-green-600">{fmt(a.approxValue)}</span>
                        {a.valueAsOf && <span className="text-xs text-gray-400 dark:text-gray-500">as of {a.valueAsOf}</span>}
                        {a.maturityDate && <span className="text-xs text-amber-600">matures {a.maturityDate}</span>}
                      </div>
                      {/* E4: Last updated */}
                      <p className="text-xs text-gray-300 mt-1">Updated {timeAgo(a.updatedAt)}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => openEdit(a)} className="text-xs text-indigo-600 hover:underline">Edit</button>
                      <button onClick={() => setDeleteId(a.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      {showModal && (
        <Modal title={editing ? 'Edit Asset' : 'Add Asset'} onClose={tryClose}>
          <div className="space-y-4">
            {/* Primary fields — always visible */}
            <FormField label="Asset Type" required>
              <select className={selectCls} value={form.assetType} onChange={e => {
                setForm(f => ({ ...f, assetType: e.target.value as AssetType, maturityDate: undefined }))
                setFormDirty(true)
              }}>
                <option value="">— Select type —</option>
                {ASSET_TYPE_GROUPS.map(g => (
                  <optgroup key={g.label} label={g.label}>
                    {g.types.map(t => <option key={t} value={t}>{ASSET_TYPE_LABELS[t]}</option>)}
                  </optgroup>
                ))}
              </select>
            </FormField>
            <FormField label="Description" required>
              <input className={inputCls} value={form.description}
                onChange={e => { setForm(f => ({ ...f, description: e.target.value })); setFormDirty(true) }}
                placeholder="e.g. HDFC Savings Account" />
            </FormField>
            <FormField label="Institution">
              <input className={inputCls} value={form.institution ?? ''} onChange={e => set('institution', e.target.value)} placeholder="Bank / Fund house name" />
            </FormField>
            <FormField label="Approximate Value (₹)">
              <input className={inputCls} type="number" min="0" value={form.approxValue ?? ''}
                onChange={e => set('approxValue', e.target.value ? Number(e.target.value) : undefined)} placeholder="0" />
            </FormField>

            {/* C1: Progressive disclosure toggle */}
            <button type="button" onClick={() => setShowMoreFields(v => !v)}
              className="w-full flex items-center justify-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 py-1">
              {showMoreFields ? '▲ Fewer details' : '▼ More details (account number, nominee, dates…)'}
            </button>

            {showMoreFields && (
              <>
                <FormField label="Account Number" hint="Masked — last 4 digits is fine">
                  <input className={inputCls} value={form.accountNumber ?? ''} onChange={e => set('accountNumber', e.target.value)} placeholder="Masked (last 4 digits OK)" />
                </FormField>
                <FormField label="Holding Mode" required hint="Who owns this asset">
                  <select className={selectCls} value={form.holdingMode} onChange={e => { setForm(f => ({ ...f, holdingMode: e.target.value as HoldingMode })); setFormDirty(true) }}>
                    {HOLDING_MODES.map(m => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}
                  </select>
                </FormField>
                {form.holdingMode !== 'SINGLE' && (
                  <FormField label="Joint Holder Name">
                    <input className={inputCls} value={form.jointHolderName ?? ''} onChange={e => set('jointHolderName', e.target.value)} placeholder="Full name of joint holder" />
                  </FormField>
                )}
                <FormField label="Nominee (Trusted Person)" hint="Who should receive this asset on your death">
                  <select className={selectCls} value={form.trustedPersonId ?? ''} onChange={e => set('trustedPersonId', e.target.value)}>
                    <option value="">— None —</option>
                    {trustedPersons.map(tp => <option key={tp.id} value={tp.id}>{tp.name}</option>)}
                  </select>
                </FormField>
                <FormField label="Value As Of">
                  <input className={inputCls} type="date" value={form.valueAsOf ?? ''} onChange={e => set('valueAsOf', e.target.value)} />
                </FormField>
                {MATURITY_TYPES.includes(form.assetType) && (
                  <FormField label="Maturity Date" hint="When this FD / NPS matures">
                    <input className={inputCls} type="date" value={form.maturityDate ?? ''} onChange={e => set('maturityDate', e.target.value)} />
                  </FormField>
                )}
                <FormField label="Location of original documents" hint="e.g. Home safe, bank locker, digital in Bitwarden">
                  <input className={inputCls} value={form.documentLocation ?? ''} onChange={e => set('documentLocation', e.target.value)} placeholder="e.g. Bank safe, home locker, digital in Bitwarden" />
                </FormField>
                <FormField label="Remarks">
                  <textarea className={inputCls} rows={2} value={form.remarks ?? ''} onChange={e => set('remarks', e.target.value)} placeholder="Any additional notes…" />
                </FormField>
              </>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={save} disabled={saving || !form.description.trim()} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg">
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add asset'}
              </button>
              <button onClick={tryClose} className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* F1: Discard confirm */}
      {showDiscardConfirm && (
        <Modal title="Discard changes?" onClose={() => setShowDiscardConfirm(false)}>
          <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-4">You have unsaved changes. Discard them?</p>
          <div className="flex gap-3">
            <button onClick={() => { setShowDiscardConfirm(false); setShowModal(false) }} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded-lg">Discard</button>
            <button onClick={() => setShowDiscardConfirm(false)} className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm py-2 rounded-lg">Keep editing</button>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <Modal title="Delete asset?" onClose={() => setDeleteId(null)}>
          <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-4">This will permanently remove the asset record.</p>
          <div className="flex gap-3">
            <button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded-lg">Delete</button>
            <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm py-2 rounded-lg">Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
