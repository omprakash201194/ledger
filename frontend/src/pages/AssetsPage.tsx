import { useEffect, useState } from 'react'
import {
  getAssets, createAsset, updateAsset, deleteAsset,
  type Asset, type AssetRequest, type AssetType, type HoldingMode,
} from '../api/assets'
import { getTrustedPersons, type TrustedPerson } from '../api/trustedPersons'
import Modal from '../components/Modal'
import { FormField, inputCls, selectCls } from '../components/FormField'

const ASSET_TYPES: AssetType[] = ['SAVINGS_ACCOUNT','FIXED_DEPOSIT','PPF','EPF','MUTUAL_FUND','EQUITY','GOLD','REAL_ESTATE','VEHICLE','OTHER']
const HOLDING_MODES: HoldingMode[] = ['SINGLE','JOINT','EITHER_OR_SURVIVOR']

const fmt = (n?: number) =>
  n != null ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n) : '—'

const blank: AssetRequest = { assetType: 'SAVINGS_ACCOUNT', description: '', holdingMode: 'SINGLE' }

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [trustedPersons, setTrustedPersons] = useState<TrustedPerson[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Asset | null>(null)
  const [form, setForm] = useState<AssetRequest>(blank)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const load = () =>
    Promise.all([getAssets(), getTrustedPersons()]).then(([a, tp]) => {
      setAssets(a.data); setTrustedPersons(tp.data); setLoading(false)
    })

  useEffect(() => { load() }, [])

  const total = assets.reduce((s, a) => s + (a.approxValue ?? 0), 0)

  const openAdd = () => { setEditing(null); setForm(blank); setShowModal(true) }
  const openEdit = (a: Asset) => {
    setEditing(a)
    setForm({
      assetType: a.assetType, description: a.description, holdingMode: a.holdingMode,
      institution: a.institution, accountNumber: a.accountNumber,
      jointHolderName: a.jointHolderName, trustedPersonId: a.trustedPersonId,
      approxValue: a.approxValue, valueAsOf: a.valueAsOf,
      documentLocation: a.documentLocation, remarks: a.remarks,
    })
    setShowModal(true)
  }

  const save = async () => {
    setSaving(true)
    try {
      if (editing) await updateAsset(editing.id, form)
      else await createAsset(form)
      setShowModal(false)
      load()
    } finally { setSaving(false) }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    await deleteAsset(deleteId)
    setDeleteId(null)
    load()
  }

  const set = (k: keyof AssetRequest, v: string | number | undefined) =>
    setForm(f => ({ ...f, [k]: v === '' ? undefined : v }))

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Assets</h1>
          <p className="text-sm text-gray-500 mt-0.5">Total: <span className="font-semibold text-green-600">{fmt(total)}</span></p>
        </div>
        <button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          + Add asset
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : assets.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🏦</p>
          <p className="text-sm">No assets yet. Add your first asset to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assets.map(a => (
            <div key={a.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-800">{a.description}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a.assetType.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex gap-4 mt-1 flex-wrap">
                  {a.institution && <span className="text-xs text-gray-500">{a.institution}</span>}
                  {a.accountNumber && <span className="text-xs text-gray-400">Acct: {a.accountNumber}</span>}
                  <span className="text-xs text-gray-500">{a.holdingMode.replace(/_/g, ' ')}</span>
                  {a.trustedPersonName && <span className="text-xs text-blue-600">Nominee: {a.trustedPersonName}</span>}
                </div>
                <div className="mt-1">
                  <span className="text-sm font-semibold text-green-600">{fmt(a.approxValue)}</span>
                  {a.valueAsOf && <span className="text-xs text-gray-400 ml-2">as of {a.valueAsOf}</span>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(a)} className="text-xs text-indigo-600 hover:underline">Edit</button>
                <button onClick={() => setDeleteId(a.id)} className="text-xs text-red-500 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Asset' : 'Add Asset'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <FormField label="Asset Type" required>
              <select className={selectCls} value={form.assetType} onChange={e => setForm(f => ({ ...f, assetType: e.target.value as AssetType }))}>
                {ASSET_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </FormField>
            <FormField label="Description" required>
              <input className={inputCls} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. HDFC Savings Account" />
            </FormField>
            <FormField label="Institution">
              <input className={inputCls} value={form.institution ?? ''} onChange={e => set('institution', e.target.value)} placeholder="Bank / Fund house name" />
            </FormField>
            <FormField label="Account Number">
              <input className={inputCls} value={form.accountNumber ?? ''} onChange={e => set('accountNumber', e.target.value)} placeholder="Masked (last 4 digits OK)" />
            </FormField>
            <FormField label="Holding Mode" required>
              <select className={selectCls} value={form.holdingMode} onChange={e => setForm(f => ({ ...f, holdingMode: e.target.value as HoldingMode }))}>
                {HOLDING_MODES.map(m => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}
              </select>
            </FormField>
            {form.holdingMode !== 'SINGLE' && (
              <FormField label="Joint Holder Name">
                <input className={inputCls} value={form.jointHolderName ?? ''} onChange={e => set('jointHolderName', e.target.value)} placeholder="Full name of joint holder" />
              </FormField>
            )}
            <FormField label="Nominee (Trusted Person)">
              <select className={selectCls} value={form.trustedPersonId ?? ''} onChange={e => set('trustedPersonId', e.target.value)}>
                <option value="">— None —</option>
                {trustedPersons.map(tp => <option key={tp.id} value={tp.id}>{tp.name}</option>)}
              </select>
            </FormField>
            <FormField label="Approximate Value (₹)">
              <input className={inputCls} type="number" min="0" value={form.approxValue ?? ''} onChange={e => set('approxValue', e.target.value ? Number(e.target.value) : undefined)} placeholder="0" />
            </FormField>
            <FormField label="Value As Of">
              <input className={inputCls} type="date" value={form.valueAsOf ?? ''} onChange={e => set('valueAsOf', e.target.value)} />
            </FormField>
            <FormField label="Document Location">
              <input className={inputCls} value={form.documentLocation ?? ''} onChange={e => set('documentLocation', e.target.value)} placeholder="Where is the document stored?" />
            </FormField>
            <FormField label="Remarks">
              <textarea className={inputCls} rows={2} value={form.remarks ?? ''} onChange={e => set('remarks', e.target.value)} placeholder="Any additional notes…" />
            </FormField>
            <div className="flex gap-3 pt-1">
              <button onClick={save} disabled={saving || !form.description.trim()} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg">
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add asset'}
              </button>
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {deleteId && (
        <Modal title="Delete asset?" onClose={() => setDeleteId(null)}>
          <p className="text-sm text-gray-600 mb-4">This will permanently remove the asset record.</p>
          <div className="flex gap-3">
            <button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded-lg">Delete</button>
            <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 rounded-lg">Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
