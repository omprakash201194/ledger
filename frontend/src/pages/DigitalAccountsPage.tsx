import { useEffect, useState } from 'react'
import {
  getDigitalAccounts, createDigitalAccount, updateDigitalAccount, deleteDigitalAccount,
  type DigitalAccount, type DigitalAccountRequest, type DigitalAccountCategory, type ActionOnDeath,
} from '../api/digitalAccounts'
import Modal from '../components/Modal'
import { FormField, inputCls, selectCls } from '../components/FormField'

const CATEGORIES: DigitalAccountCategory[] = ['PASSWORD_MANAGER','EMAIL','BANKING','INVESTMENT','SOCIAL_MEDIA','GOVERNMENT','SUBSCRIPTION','OTHER']
const ACTIONS: ActionOnDeath[] = ['TRANSFER','ARCHIVE','CLOSE','MEMORIALIZE']

const categoryIcon: Record<DigitalAccountCategory, string> = {
  PASSWORD_MANAGER: '🔐', EMAIL: '✉️', BANKING: '🏦', INVESTMENT: '📈',
  SOCIAL_MEDIA: '💬', GOVERNMENT: '🏛️', SUBSCRIPTION: '📺', OTHER: '🌐',
}

const blank: DigitalAccountRequest = { category: 'EMAIL', serviceName: '' }

export default function DigitalAccountsPage() {
  const [accounts, setAccounts] = useState<DigitalAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<DigitalAccount | null>(null)
  const [form, setForm] = useState<DigitalAccountRequest>(blank)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const load = () =>
    getDigitalAccounts().then(r => { setAccounts(r.data); setLoading(false) })

  useEffect(() => { load() }, [])

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = accounts.filter(a => a.category === cat)
    if (items.length > 0) acc[cat] = items
    return acc
  }, {} as Record<DigitalAccountCategory, DigitalAccount[]>)

  const openAdd = () => { setEditing(null); setForm(blank); setShowModal(true) }
  const openEdit = (a: DigitalAccount) => {
    setEditing(a)
    setForm({
      category: a.category, serviceName: a.serviceName, username: a.username,
      credentialLocation: a.credentialLocation, twoFaMethod: a.twoFaMethod,
      recoveryContact: a.recoveryContact, actionOnDeath: a.actionOnDeath, remarks: a.remarks,
    })
    setShowModal(true)
  }

  const save = async () => {
    setSaving(true)
    try {
      if (editing) await updateDigitalAccount(editing.id, form)
      else await createDigitalAccount(form)
      setShowModal(false)
      load()
    } finally { setSaving(false) }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    await deleteDigitalAccount(deleteId)
    setDeleteId(null)
    load()
  }

  const set = (k: keyof DigitalAccountRequest, v: string) =>
    setForm(f => ({ ...f, [k]: v || undefined }))

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Digital Accounts</h1>
          <p className="text-sm text-gray-500 mt-0.5">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          + Add account
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : accounts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🌐</p>
          <p className="text-sm">No digital accounts yet. Document where your credentials live.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {(Object.entries(grouped) as [DigitalAccountCategory, DigitalAccount[]][]).map(([cat, items]) => (
            <div key={cat}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                {categoryIcon[cat]} {cat.replace(/_/g, ' ')}
              </h2>
              <div className="space-y-2">
                {items.map(a => (
                  <div key={a.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-medium text-gray-800">{a.serviceName}</span>
                      <div className="flex gap-4 mt-1 flex-wrap">
                        {a.username && <span className="text-xs text-gray-500">@{a.username}</span>}
                        {a.credentialLocation && <span className="text-xs text-blue-600">🔑 {a.credentialLocation}</span>}
                        {a.twoFaMethod && <span className="text-xs text-gray-400">2FA: {a.twoFaMethod}</span>}
                        {a.actionOnDeath && <span className="text-xs text-orange-500">{a.actionOnDeath}</span>}
                      </div>
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

      {showModal && (
        <Modal title={editing ? 'Edit Account' : 'Add Digital Account'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <FormField label="Category" required>
              <select className={selectCls} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as DigitalAccountCategory }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </select>
            </FormField>
            <FormField label="Service Name" required>
              <input className={inputCls} value={form.serviceName} onChange={e => setForm(f => ({ ...f, serviceName: e.target.value }))} placeholder="e.g. Gmail, HDFC NetBanking" />
            </FormField>
            <FormField label="Username / Email">
              <input className={inputCls} value={form.username ?? ''} onChange={e => set('username', e.target.value)} placeholder="Login username or email" />
            </FormField>
            <FormField label="Credential Location">
              <input className={inputCls} value={form.credentialLocation ?? ''} onChange={e => set('credentialLocation', e.target.value)} placeholder="e.g. In Bitwarden vault" />
            </FormField>
            <FormField label="2FA Method">
              <input className={inputCls} value={form.twoFaMethod ?? ''} onChange={e => set('twoFaMethod', e.target.value)} placeholder="e.g. Authenticator app, SMS" />
            </FormField>
            <FormField label="Recovery Contact">
              <input className={inputCls} value={form.recoveryContact ?? ''} onChange={e => set('recoveryContact', e.target.value)} placeholder="Recovery email or phone" />
            </FormField>
            <FormField label="Action on Death">
              <select className={selectCls} value={form.actionOnDeath ?? ''} onChange={e => set('actionOnDeath', e.target.value)}>
                <option value="">— Not set —</option>
                {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </FormField>
            <FormField label="Remarks">
              <textarea className={inputCls} rows={2} value={form.remarks ?? ''} onChange={e => set('remarks', e.target.value)} placeholder="Any additional notes…" />
            </FormField>
            <div className="flex gap-3 pt-1">
              <button onClick={save} disabled={saving || !form.serviceName.trim()} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg">
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add account'}
              </button>
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {deleteId && (
        <Modal title="Delete account?" onClose={() => setDeleteId(null)}>
          <p className="text-sm text-gray-600 mb-4">This will permanently remove the digital account record.</p>
          <div className="flex gap-3">
            <button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded-lg">Delete</button>
            <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 rounded-lg">Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
