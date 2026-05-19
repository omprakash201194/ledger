import { useEffect, useState } from 'react'
import {
  getInsurancePolicies, createInsurancePolicy, updateInsurancePolicy, deleteInsurancePolicy,
  type InsurancePolicy, type InsurancePolicyRequest, type PolicyType,
} from '../api/insurance'
import { getTrustedPersons, type TrustedPerson } from '../api/trustedPersons'
import Modal from '../components/Modal'
import { FormField, inputCls, selectCls } from '../components/FormField'

const POLICY_TYPES: PolicyType[] = ['TERM_LIFE','WHOLE_LIFE','HEALTH','VEHICLE','PROPERTY','OTHER']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const fmt = (n?: number) =>
  n != null ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n) : '—'

const blank: InsurancePolicyRequest = { policyType: 'TERM_LIFE', insurer: '' }

export default function InsurancePage() {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([])
  const [trustedPersons, setTrustedPersons] = useState<TrustedPerson[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<InsurancePolicy | null>(null)
  const [form, setForm] = useState<InsurancePolicyRequest>(blank)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const load = () =>
    Promise.all([getInsurancePolicies(), getTrustedPersons()]).then(([p, tp]) => {
      setPolicies(p.data); setTrustedPersons(tp.data); setLoading(false)
    })

  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm(blank); setShowModal(true) }
  const openEdit = (p: InsurancePolicy) => {
    setEditing(p)
    setForm({
      policyType: p.policyType, insurer: p.insurer, policyNumber: p.policyNumber,
      lifeAssured: p.lifeAssured, sumAssured: p.sumAssured, premiumAmount: p.premiumAmount,
      premiumDueMonth: p.premiumDueMonth, premiumDueDay: p.premiumDueDay,
      trustedPersonId: p.trustedPersonId, maturityDate: p.maturityDate,
      documentLocation: p.documentLocation, remarks: p.remarks,
    })
    setShowModal(true)
  }

  const save = async () => {
    setSaving(true)
    try {
      if (editing) await updateInsurancePolicy(editing.id, form)
      else await createInsurancePolicy(form)
      setShowModal(false)
      load()
    } finally { setSaving(false) }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    await deleteInsurancePolicy(deleteId)
    setDeleteId(null)
    load()
  }

  const set = (k: keyof InsurancePolicyRequest, v: string | number | undefined) =>
    setForm(f => ({ ...f, [k]: v === '' ? undefined : v }))

  const dueDateLabel = (p: InsurancePolicy) => {
    if (p.premiumDueMonth && p.premiumDueDay)
      return `${p.premiumDueDay} ${MONTHS[p.premiumDueMonth - 1]}`
    return null
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Insurance</h1>
          <p className="text-sm text-gray-500 mt-0.5">{policies.length} polic{policies.length !== 1 ? 'ies' : 'y'}</p>
        </div>
        <button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          + Add policy
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : policies.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🛡️</p>
          <p className="text-sm">No insurance policies yet. Add your life or health policies.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {policies.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-800">{p.insurer}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{p.policyType.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex gap-4 mt-1 flex-wrap">
                  {p.policyNumber && <span className="text-xs text-gray-400">#{p.policyNumber}</span>}
                  {p.lifeAssured && <span className="text-xs text-gray-500">Life assured: {p.lifeAssured}</span>}
                  {p.sumAssured && <span className="text-xs text-gray-500">Sum: {fmt(p.sumAssured)}</span>}
                  {p.premiumAmount && <span className="text-xs text-gray-500">Premium: {fmt(p.premiumAmount)}</span>}
                  {dueDateLabel(p) && <span className="text-xs text-orange-500">Due: {dueDateLabel(p)}</span>}
                  {p.trustedPersonName && <span className="text-xs text-blue-600">Beneficiary: {p.trustedPersonName}</span>}
                </div>
                {p.maturityDate && <p className="text-xs text-gray-400 mt-1">Matures: {p.maturityDate}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(p)} className="text-xs text-indigo-600 hover:underline">Edit</button>
                <button onClick={() => setDeleteId(p.id)} className="text-xs text-red-500 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Policy' : 'Add Policy'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <FormField label="Policy Type" required>
              <select className={selectCls} value={form.policyType} onChange={e => setForm(f => ({ ...f, policyType: e.target.value as PolicyType }))}>
                {POLICY_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </FormField>
            <FormField label="Insurer" required>
              <input className={inputCls} value={form.insurer} onChange={e => setForm(f => ({ ...f, insurer: e.target.value }))} placeholder="e.g. LIC, HDFC Life" />
            </FormField>
            <FormField label="Policy Number">
              <input className={inputCls} value={form.policyNumber ?? ''} onChange={e => set('policyNumber', e.target.value)} placeholder="Masked OK" />
            </FormField>
            <FormField label="Life Assured">
              <input className={inputCls} value={form.lifeAssured ?? ''} onChange={e => set('lifeAssured', e.target.value)} placeholder="Name of person insured" />
            </FormField>
            <FormField label="Sum Assured (₹)">
              <input className={inputCls} type="number" min="0" value={form.sumAssured ?? ''} onChange={e => set('sumAssured', e.target.value ? Number(e.target.value) : undefined)} />
            </FormField>
            <FormField label="Premium Amount (₹)">
              <input className={inputCls} type="number" min="0" value={form.premiumAmount ?? ''} onChange={e => set('premiumAmount', e.target.value ? Number(e.target.value) : undefined)} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Premium Due Month">
                <select className={selectCls} value={form.premiumDueMonth ?? ''} onChange={e => set('premiumDueMonth', e.target.value ? Number(e.target.value) : undefined)}>
                  <option value="">— Month —</option>
                  {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                </select>
              </FormField>
              <FormField label="Premium Due Day">
                <input className={inputCls} type="number" min="1" max="31" value={form.premiumDueDay ?? ''} onChange={e => set('premiumDueDay', e.target.value ? Number(e.target.value) : undefined)} placeholder="1–31" />
              </FormField>
            </div>
            <FormField label="Beneficiary (Trusted Person)">
              <select className={selectCls} value={form.trustedPersonId ?? ''} onChange={e => set('trustedPersonId', e.target.value)}>
                <option value="">— None —</option>
                {trustedPersons.map(tp => <option key={tp.id} value={tp.id}>{tp.name}</option>)}
              </select>
            </FormField>
            <FormField label="Maturity Date">
              <input className={inputCls} type="date" value={form.maturityDate ?? ''} onChange={e => set('maturityDate', e.target.value)} />
            </FormField>
            <FormField label="Document Location">
              <input className={inputCls} value={form.documentLocation ?? ''} onChange={e => set('documentLocation', e.target.value)} placeholder="Where is the policy document?" />
            </FormField>
            <FormField label="Remarks">
              <textarea className={inputCls} rows={2} value={form.remarks ?? ''} onChange={e => set('remarks', e.target.value)} placeholder="Any additional notes…" />
            </FormField>
            <div className="flex gap-3 pt-1">
              <button onClick={save} disabled={saving || !form.insurer.trim()} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg">
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add policy'}
              </button>
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {deleteId && (
        <Modal title="Delete policy?" onClose={() => setDeleteId(null)}>
          <p className="text-sm text-gray-600 mb-4">This will permanently remove the insurance policy record.</p>
          <div className="flex gap-3">
            <button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded-lg">Delete</button>
            <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 rounded-lg">Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
