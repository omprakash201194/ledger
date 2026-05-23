import { useEffect, useState } from 'react'
import SectionIntro from '../components/SectionIntro'
import {
  getLiabilities, createLiability, updateLiability, deleteLiability,
  type Liability, type LiabilityRequest, type LiabilityType,
} from '../api/liabilities'
import { getAssets, type Asset } from '../api/assets'
import Modal from '../components/Modal'
import { FormField, inputCls, selectCls } from '../components/FormField'
import SkeletonCard from '../components/SkeletonCard'
import { useToastStore } from '../store/toastStore'
import { timeAgo } from '../utils/timeAgo'

const LIABILITY_TYPES: LiabilityType[] = ['HOME_LOAN','CAR_LOAN','PERSONAL_LOAN','EDUCATION_LOAN','CREDIT_CARD','OTHER']

const fmt = (n?: number) =>
  n != null ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n) : '—'

const blank: LiabilityRequest = { liabilityType: 'HOME_LOAN', lender: '' }

export default function LiabilitiesPage() {
  const [liabilities, setLiabilities] = useState<Liability[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Liability | null>(null)
  const [form, setForm] = useState<LiabilityRequest>(blank)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formDirty, setFormDirty] = useState(false)
  const [showDiscard, setShowDiscard] = useState(false)
  const toast = useToastStore()

  const load = () =>
    Promise.all([getLiabilities(), getAssets()]).then(([l, a]) => {
      setLiabilities(l.data); setAssets(a.data); setLoading(false)
    })

  useEffect(() => { load() }, [])

  const total = liabilities.reduce((s, l) => s + (l.outstandingBalance ?? 0), 0)

  const openAdd = () => { setEditing(null); setForm(blank); setFormDirty(false); setShowModal(true) }
  const openEdit = (l: Liability) => {
    setEditing(l)
    setForm({
      liabilityType: l.liabilityType, lender: l.lender,
      accountNumber: l.accountNumber, originalAmount: l.originalAmount,
      outstandingBalance: l.outstandingBalance, emiAmount: l.emiAmount,
      tenureEndDate: l.tenureEndDate, linkedAssetId: l.linkedAssetId, remarks: l.remarks,
    })
    setFormDirty(false)
    setShowModal(true)
  }

  const tryClose = () => {
    if (formDirty) { setShowDiscard(true) } else { setShowModal(false) }
  }

  const save = async () => {
    setSaving(true)
    try {
      if (editing) {
        await updateLiability(editing.id, form)
        toast.show('Liability updated ✓')
      } else {
        await createLiability(form)
        toast.show('Liability added ✓')
      }
      setShowModal(false)
      load()
    } catch {
      toast.show('Failed to save', 'error')
    } finally { setSaving(false) }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      await deleteLiability(deleteId)
      toast.show('Liability deleted')
    } catch {
      toast.show('Failed to delete', 'error')
    }
    setDeleteId(null)
    load()
  }

  const set = (k: keyof LiabilityRequest, v: string | number | undefined) => {
    setFormDirty(true)
    setForm(f => ({ ...f, [k]: v === '' ? undefined : v }))
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">Liabilities</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-0.5">Outstanding: <span className="font-semibold text-red-600">{fmt(total)}</span></p>
        </div>
        <button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          + Add liability
        </button>
      </div>

      <SectionIntro sectionKey="liabilities" note="All outstanding loans and dues — home loan, car loan, personal loan, credit card balances, money you've borrowed from family. Recording these protects your family from surprise demands and helps them claim any loan-protection insurance that may apply." />

      {loading ? (
        <SkeletonCard rows={3} />
      ) : liabilities.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <p className="text-4xl mb-3">💳</p>
          <p className="text-sm mb-4">No liabilities recorded. Add loans or credit card debts.</p>
          <button onClick={openAdd} className="text-sm text-indigo-600 border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-50">
            + Add your first liability
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {liabilities.map(l => (
            <div key={l.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-800 dark:text-gray-200">{l.lender}</span>
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 dark:text-gray-500 px-2 py-0.5 rounded-full">{l.liabilityType.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex gap-4 mt-1 flex-wrap">
                  {l.accountNumber && <span className="text-xs text-gray-400 dark:text-gray-500">Acct: {l.accountNumber}</span>}
                  {l.emiAmount && <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">EMI: {fmt(l.emiAmount)}/mo</span>}
                  {l.tenureEndDate && <span className="text-xs text-gray-400 dark:text-gray-500">Ends: {l.tenureEndDate}</span>}
                  {l.linkedAssetDescription && <span className="text-xs text-blue-600">Asset: {l.linkedAssetDescription}</span>}
                </div>
                <div className="mt-1">
                  <span className="text-sm font-semibold text-red-600">{fmt(l.outstandingBalance)}</span>
                  {l.originalAmount && <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">of {fmt(l.originalAmount)}</span>}
                </div>
                <p className="text-xs text-gray-300 mt-1">Updated {timeAgo(l.updatedAt)}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(l)} className="text-xs text-indigo-600 hover:underline">Edit</button>
                <button onClick={() => setDeleteId(l.id)} className="text-xs text-red-500 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Liability' : 'Add Liability'} onClose={tryClose}>
          <div className="space-y-4">
            <FormField label="Type" required>
              <select className={selectCls} value={form.liabilityType} onChange={e => { setFormDirty(true); setForm(f => ({ ...f, liabilityType: e.target.value as LiabilityType })) }}>
                {LIABILITY_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </FormField>
            <FormField label="Lender" required>
              <input className={inputCls} value={form.lender} onChange={e => { setFormDirty(true); setForm(f => ({ ...f, lender: e.target.value })) }} placeholder="e.g. HDFC Bank, SBI" />
            </FormField>
            <FormField label="Account Number" hint="Last 4 digits or masked number is fine">
              <input className={inputCls} value={form.accountNumber ?? ''} onChange={e => set('accountNumber', e.target.value)} placeholder="Masked (last 4 digits OK)" />
            </FormField>
            <FormField label="Original Amount (₹)">
              <input className={inputCls} type="number" min="0" value={form.originalAmount ?? ''} onChange={e => set('originalAmount', e.target.value ? Number(e.target.value) : undefined)} placeholder="0" />
            </FormField>
            <FormField label="Outstanding Balance (₹)">
              <input className={inputCls} type="number" min="0" value={form.outstandingBalance ?? ''} onChange={e => set('outstandingBalance', e.target.value ? Number(e.target.value) : undefined)} placeholder="0" />
            </FormField>
            <FormField label="EMI Amount (₹/month)">
              <input className={inputCls} type="number" min="0" value={form.emiAmount ?? ''} onChange={e => set('emiAmount', e.target.value ? Number(e.target.value) : undefined)} placeholder="0" />
            </FormField>
            <FormField label="Tenure End Date">
              <input className={inputCls} type="date" value={form.tenureEndDate ?? ''} onChange={e => set('tenureEndDate', e.target.value)} />
            </FormField>
            <FormField label="Linked Asset">
              <select className={selectCls} value={form.linkedAssetId ?? ''} onChange={e => set('linkedAssetId', e.target.value)}>
                <option value="">— None —</option>
                {assets.map(a => <option key={a.id} value={a.id}>{a.description}</option>)}
              </select>
            </FormField>
            <FormField label="Remarks">
              <textarea className={inputCls} rows={2} value={form.remarks ?? ''} onChange={e => set('remarks', e.target.value)} placeholder="Any additional notes…" />
            </FormField>
            <div className="flex gap-3 pt-1">
              <button onClick={save} disabled={saving || !form.lender.trim()} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg">
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add liability'}
              </button>
              <button onClick={tryClose} className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {showDiscard && (
        <Modal title="Discard changes?" onClose={() => setShowDiscard(false)}>
          <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-4">You have unsaved changes. Discard them?</p>
          <div className="flex gap-3">
            <button onClick={() => { setShowDiscard(false); setShowModal(false) }} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded-lg">Discard</button>
            <button onClick={() => setShowDiscard(false)} className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm py-2 rounded-lg">Keep editing</button>
          </div>
        </Modal>
      )}

      {deleteId && (
        <Modal title="Delete liability?" onClose={() => setDeleteId(null)}>
          <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-4">This will permanently remove the liability record.</p>
          <div className="flex gap-3">
            <button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded-lg">Delete</button>
            <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm py-2 rounded-lg">Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
