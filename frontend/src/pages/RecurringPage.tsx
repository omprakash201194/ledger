import { useEffect, useState } from 'react'
import SectionIntro from '../components/SectionIntro'
import {
  getRecurringObligations, createRecurringObligation, updateRecurringObligation, deleteRecurringObligation,
  type RecurringObligation, type RecurringObligationRequest, type ObligationType, type Frequency, type ActionOnDeath,
} from '../api/recurring'
import Modal from '../components/Modal'
import { FormField, inputCls, selectCls } from '../components/FormField'
import SkeletonCard from '../components/SkeletonCard'
import { useToastStore } from '../store/toastStore'
import { timeAgo } from '../utils/timeAgo'

const OBLIGATION_TYPES: ObligationType[] = ['LOAN_EMI','SIP','INSURANCE_PREMIUM','SUBSCRIPTION','UTILITY','OTHER']
const FREQUENCIES: Frequency[] = ['MONTHLY','QUARTERLY','HALF_YEARLY','YEARLY']
const ACTIONS: ActionOnDeath[] = ['CONTINUE','CANCEL','REVIEW']

const fmt = (n?: number) =>
  n != null ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n) : '—'

const actionColor: Record<ActionOnDeath, string> = {
  CONTINUE: 'bg-green-100 text-green-700',
  CANCEL: 'bg-red-100 text-red-700',
  REVIEW: 'bg-amber-100 text-amber-700',
}

const blank: RecurringObligationRequest = { obligationType: 'LOAN_EMI', payee: '', amount: 0, frequency: 'MONTHLY' }

export default function RecurringPage() {
  const [obligations, setObligations] = useState<RecurringObligation[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<RecurringObligation | null>(null)
  const [form, setForm] = useState<RecurringObligationRequest>(blank)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const toast = useToastStore()

  const load = () =>
    getRecurringObligations().then(r => { setObligations(r.data); setLoading(false) })

  useEffect(() => { load() }, [])

  const monthlyOutflow = obligations
    .filter(o => o.frequency === 'MONTHLY')
    .reduce((s, o) => s + o.amount, 0)

  const openAdd = () => { setEditing(null); setForm(blank); setShowModal(true) }
  const openEdit = (o: RecurringObligation) => {
    setEditing(o)
    setForm({
      obligationType: o.obligationType, payee: o.payee, amount: o.amount,
      frequency: o.frequency, dueDay: o.dueDay, paymentSource: o.paymentSource,
      actionOnDeath: o.actionOnDeath, remarks: o.remarks,
    })
    setShowModal(true)
  }

  const save = async () => {
    if (!form.payee.trim()) return
    setSaving(true)
    try {
      if (editing) {
        await updateRecurringObligation(editing.id, form)
        toast.show('Obligation updated ✓')
      } else {
        await createRecurringObligation(form)
        toast.show('Obligation added ✓')
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
      await deleteRecurringObligation(deleteId)
      toast.show('Obligation deleted')
    } catch {
      toast.show('Failed to delete', 'error')
    }
    setDeleteId(null)
    load()
  }

  const set = (k: keyof RecurringObligationRequest, v: string | number | undefined) =>
    setForm(f => ({ ...f, [k]: v === '' ? undefined : v }))

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Recurring Obligations</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Monthly outflow: <span className="font-semibold text-orange-600">{fmt(monthlyOutflow)}</span>
          </p>
        </div>
        <button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          + Add
        </button>
      </div>

      <SectionIntro note="Auto-debits, SIPs, subscriptions and standing instructions — anything that keeps charging your account whether or not you act on it. Mark each one as Continue / Cancel / Transfer so your family knows what to stop and what to keep running." />

      {loading ? (
        <SkeletonCard rows={3} />
      ) : obligations.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔄</p>
          <p className="text-sm mb-4">No recurring obligations. Add EMIs, SIPs, or subscriptions.</p>
          <button onClick={openAdd} className="text-sm text-indigo-600 border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-50">
            + Add your first obligation
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {obligations.map(o => (
            <div key={o.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-800">{o.payee}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{o.obligationType.replace(/_/g, ' ')}</span>
                  {o.actionOnDeath && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${actionColor[o.actionOnDeath]}`}>{o.actionOnDeath}</span>
                  )}
                </div>
                <div className="flex gap-4 mt-1 flex-wrap">
                  <span className="text-sm font-semibold text-orange-600">{fmt(o.amount)}</span>
                  <span className="text-xs text-gray-500">{o.frequency.replace(/_/g, ' ')}</span>
                  {o.dueDay && <span className="text-xs text-gray-400">Due: {o.dueDay}th</span>}
                  {o.paymentSource && <span className="text-xs text-gray-400">via {o.paymentSource}</span>}
                </div>
                <p className="text-xs text-gray-300 mt-1">Updated {timeAgo(o.updatedAt)}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(o)} className="text-xs text-indigo-600 hover:underline">Edit</button>
                <button onClick={() => setDeleteId(o.id)} className="text-xs text-red-500 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Obligation' : 'Add Obligation'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <FormField label="Type" required>
              <select className={selectCls} value={form.obligationType} onChange={e => setForm(f => ({ ...f, obligationType: e.target.value as ObligationType }))}>
                {OBLIGATION_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </FormField>
            <FormField label="Payee" required>
              <input
                className={inputCls}
                value={form.payee}
                onChange={e => setForm(f => ({ ...f, payee: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && save()}
                placeholder="e.g. HDFC Bank, Netflix"
              />
            </FormField>
            <FormField label="Amount (₹)" required>
              <input
                className={inputCls}
                type="number"
                min="0"
                value={form.amount || ''}
                onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))}
                onKeyDown={e => e.key === 'Enter' && save()}
                placeholder="0"
              />
            </FormField>
            <FormField label="Frequency" required>
              <select className={selectCls} value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value as Frequency }))}>
                {FREQUENCIES.map(f => <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>)}
              </select>
            </FormField>
            <FormField label="Due Day (1–31)" hint="Day of the month the payment is deducted">
              <input className={inputCls} type="number" min="1" max="31" value={form.dueDay ?? ''} onChange={e => set('dueDay', e.target.value ? Number(e.target.value) : undefined)} placeholder="Day of month" />
            </FormField>
            <FormField label="Payment Source" hint="e.g. which bank account auto-debits this">
              <input className={inputCls} value={form.paymentSource ?? ''} onChange={e => set('paymentSource', e.target.value)} placeholder="e.g. HDFC Savings Acct ****1234" />
            </FormField>
            <FormField label="Action on Death" hint="What should happen to this payment if you pass away">
              <select className={selectCls} value={form.actionOnDeath ?? ''} onChange={e => set('actionOnDeath', e.target.value)}>
                <option value="">— Not set —</option>
                {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </FormField>
            <FormField label="Remarks">
              <textarea className={inputCls} rows={2} value={form.remarks ?? ''} onChange={e => set('remarks', e.target.value)} placeholder="Any additional notes…" />
            </FormField>
            <div className="flex gap-3 pt-1">
              <button onClick={save} disabled={saving || !form.payee.trim()} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg">
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add obligation'}
              </button>
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {deleteId && (
        <Modal title="Delete obligation?" onClose={() => setDeleteId(null)}>
          <p className="text-sm text-gray-600 mb-4">This will permanently remove the recurring obligation record.</p>
          <div className="flex gap-3">
            <button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded-lg">Delete</button>
            <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 rounded-lg">Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
