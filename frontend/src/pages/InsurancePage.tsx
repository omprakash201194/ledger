import { useEffect, useState } from 'react'
import SectionIntro from '../components/SectionIntro'
import {
  getInsurancePolicies, createInsurancePolicy, updateInsurancePolicy, deleteInsurancePolicy,
  type InsurancePolicy, type InsurancePolicyRequest, type PolicyType,
} from '../api/insurance'
import { getTrustedPersons, type TrustedPerson } from '../api/trustedPersons'
import Modal from '../components/Modal'
import { FormField, inputCls, selectCls } from '../components/FormField'
import SkeletonCard from '../components/SkeletonCard'
import { useToastStore } from '../store/toastStore'
import { timeAgo } from '../utils/timeAgo'

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
  const [showMore, setShowMore] = useState(false)
  const [formDirty, setFormDirty] = useState(false)
  const [showDiscard, setShowDiscard] = useState(false)
  const toast = useToastStore()

  const load = () =>
    Promise.all([getInsurancePolicies(), getTrustedPersons()]).then(([p, tp]) => {
      setPolicies(p.data); setTrustedPersons(tp.data); setLoading(false)
    })

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditing(null); setForm(blank); setShowMore(false); setFormDirty(false); setShowModal(true)
  }
  const openEdit = (p: InsurancePolicy) => {
    setEditing(p)
    setForm({
      policyType: p.policyType, insurer: p.insurer, policyNumber: p.policyNumber,
      lifeAssured: p.lifeAssured, sumAssured: p.sumAssured, premiumAmount: p.premiumAmount,
      premiumDueMonth: p.premiumDueMonth, premiumDueDay: p.premiumDueDay,
      trustedPersonId: p.trustedPersonId, maturityDate: p.maturityDate,
      documentLocation: p.documentLocation, remarks: p.remarks,
    })
    // Auto-expand if any optional fields are populated
    const hasOptional = !!(p.premiumDueMonth || p.trustedPersonId || p.maturityDate || p.documentLocation || p.remarks)
    setShowMore(hasOptional)
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
        await updateInsurancePolicy(editing.id, form)
        toast.show('Policy updated ✓')
      } else {
        await createInsurancePolicy(form)
        toast.show('Policy added ✓')
      }
      setShowModal(false)
      load()
    } catch {
      toast.show('Failed to save policy', 'error')
    } finally { setSaving(false) }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      await deleteInsurancePolicy(deleteId)
      toast.show('Policy deleted')
    } catch {
      toast.show('Failed to delete', 'error')
    }
    setDeleteId(null)
    load()
  }

  const set = (k: keyof InsurancePolicyRequest, v: string | number | undefined) => {
    setFormDirty(true)
    setForm(f => ({ ...f, [k]: v === '' ? undefined : v }))
  }

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

      <SectionIntro note="Document all active policies — life, health, vehicle, and property. Include the policy number and beneficiary so your family can file a claim quickly without searching through physical papers." />

      {loading ? (
        <SkeletonCard rows={3} />
      ) : policies.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🛡️</p>
          <p className="text-sm mb-4">No insurance policies yet. Add your life or health policies.</p>
          <button onClick={openAdd} className="text-sm text-indigo-600 border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-50">
            + Add your first policy
          </button>
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
                <p className="text-xs text-gray-300 mt-1">Updated {timeAgo(p.updatedAt)}</p>
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
        <Modal title={editing ? 'Edit Policy' : 'Add Policy'} onClose={tryClose}>
          <div className="space-y-4">
            {/* Primary fields — always visible */}
            <FormField label="Policy Type" required>
              <select className={selectCls} value={form.policyType} onChange={e => { setFormDirty(true); setForm(f => ({ ...f, policyType: e.target.value as PolicyType })) }}>
                {POLICY_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </FormField>
            <FormField label="Insurer" required>
              <input className={inputCls} value={form.insurer} onChange={e => { setFormDirty(true); setForm(f => ({ ...f, insurer: e.target.value })) }} placeholder="e.g. LIC, HDFC Life" />
            </FormField>
            <FormField label="Policy Number" hint="Partial / masked number is fine">
              <input className={inputCls} value={form.policyNumber ?? ''} onChange={e => set('policyNumber', e.target.value)} placeholder="Optional" />
            </FormField>
            <FormField label="Sum Assured (₹)" hint="Total coverage amount">
              <input className={inputCls} type="number" min="0" value={form.sumAssured ?? ''} onChange={e => set('sumAssured', e.target.value ? Number(e.target.value) : undefined)} />
            </FormField>
            <FormField label="Premium Amount (₹)">
              <input className={inputCls} type="number" min="0" value={form.premiumAmount ?? ''} onChange={e => set('premiumAmount', e.target.value ? Number(e.target.value) : undefined)} />
            </FormField>

            {/* More details toggle */}
            <button
              type="button"
              onClick={() => setShowMore(v => !v)}
              className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              {showMore ? '▲ Hide details' : '▼ More details'}
            </button>

            {showMore && (
              <>
                <FormField label="Life Assured" hint="Name of the person insured">
                  <input className={inputCls} value={form.lifeAssured ?? ''} onChange={e => set('lifeAssured', e.target.value)} placeholder="e.g. Self, Spouse" />
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
                <FormField label="Beneficiary (Trusted Person)" hint="Person who will receive the payout">
                  <select className={selectCls} value={form.trustedPersonId ?? ''} onChange={e => set('trustedPersonId', e.target.value)}>
                    <option value="">— None —</option>
                    {trustedPersons.map(tp => <option key={tp.id} value={tp.id}>{tp.name}</option>)}
                  </select>
                </FormField>
                <FormField label="Maturity Date">
                  <input className={inputCls} type="date" value={form.maturityDate ?? ''} onChange={e => set('maturityDate', e.target.value)} />
                </FormField>
                <FormField label="Location of original documents" hint="e.g. Home safe, bank locker, Bitwarden">
                  <input className={inputCls} value={form.documentLocation ?? ''} onChange={e => set('documentLocation', e.target.value)} placeholder="e.g. Home safe, bank locker" />
                </FormField>
                <FormField label="Remarks">
                  <textarea className={inputCls} rows={2} value={form.remarks ?? ''} onChange={e => set('remarks', e.target.value)} placeholder="Any additional notes…" />
                </FormField>
              </>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={save} disabled={saving || !form.insurer.trim()} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg">
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add policy'}
              </button>
              <button onClick={tryClose} className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {showDiscard && (
        <Modal title="Discard changes?" onClose={() => setShowDiscard(false)}>
          <p className="text-sm text-gray-600 mb-4">You have unsaved changes. Discard them?</p>
          <div className="flex gap-3">
            <button onClick={() => { setShowDiscard(false); setShowModal(false) }} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded-lg">Discard</button>
            <button onClick={() => setShowDiscard(false)} className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 rounded-lg">Keep editing</button>
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
