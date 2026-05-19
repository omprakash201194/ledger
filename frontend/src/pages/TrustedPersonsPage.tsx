import { useEffect, useState } from 'react'
import {
  getTrustedPersons, createTrustedPerson, updateTrustedPerson, deleteTrustedPerson,
  type TrustedPerson, type TrustedPersonRequest, type TrustedPersonType,
} from '../api/trustedPersons'
import Modal from '../components/Modal'
import { FormField, inputCls, selectCls } from '../components/FormField'

const TYPES: TrustedPersonType[] = ['FAMILY', 'ADVISOR', 'EXECUTOR']

const typeBadge: Record<TrustedPersonType, string> = {
  FAMILY: 'bg-blue-100 text-blue-700',
  ADVISOR: 'bg-purple-100 text-purple-700',
  EXECUTOR: 'bg-amber-100 text-amber-700',
}

const blank: TrustedPersonRequest = { name: '', type: 'FAMILY' }

export default function TrustedPersonsPage() {
  const [persons, setPersons] = useState<TrustedPerson[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<TrustedPerson | null>(null)
  const [form, setForm] = useState<TrustedPersonRequest>(blank)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const load = () =>
    getTrustedPersons().then(r => { setPersons(r.data); setLoading(false) })

  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm(blank); setShowModal(true) }
  const openEdit = (p: TrustedPerson) => {
    setEditing(p)
    setForm({ name: p.name, type: p.type, relationship: p.relationship, phone: p.phone, email: p.email, notes: p.notes })
    setShowModal(true)
  }

  const save = async () => {
    setSaving(true)
    try {
      if (editing) await updateTrustedPerson(editing.id, form)
      else await createTrustedPerson(form)
      setShowModal(false)
      load()
    } finally { setSaving(false) }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    await deleteTrustedPerson(deleteId)
    setDeleteId(null)
    load()
  }

  const set = (k: keyof TrustedPersonRequest, v: string) => setForm(f => ({ ...f, [k]: v || undefined }))

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Trusted Persons</h1>
          <p className="text-sm text-gray-500 mt-0.5">{persons.length} contact{persons.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          + Add person
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : persons.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-sm">No trusted persons yet. Add someone your family should contact.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {persons.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-800">{p.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeBadge[p.type]}`}>{p.type}</span>
                  {p.relationship && <span className="text-xs text-gray-400">{p.relationship}</span>}
                </div>
                <div className="flex gap-4 mt-1 flex-wrap">
                  {p.phone && <span className="text-xs text-gray-500">📞 {p.phone}</span>}
                  {p.email && <span className="text-xs text-gray-500">✉️ {p.email}</span>}
                </div>
                {p.notes && <p className="text-xs text-gray-400 mt-1 truncate">{p.notes}</p>}
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
        <Modal title={editing ? 'Edit Person' : 'Add Trusted Person'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <FormField label="Name" required>
              <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
            </FormField>
            <FormField label="Type" required>
              <select className={selectCls} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as TrustedPersonType }))}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Relationship">
              <input className={inputCls} value={form.relationship ?? ''} onChange={e => set('relationship', e.target.value)} placeholder="e.g. Spouse, Brother, CA" />
            </FormField>
            <FormField label="Phone">
              <input className={inputCls} value={form.phone ?? ''} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
            </FormField>
            <FormField label="Email">
              <input className={inputCls} type="email" value={form.email ?? ''} onChange={e => set('email', e.target.value)} placeholder="email@example.com" />
            </FormField>
            <FormField label="Notes">
              <textarea className={inputCls} rows={2} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} placeholder="Any notes for your family…" />
            </FormField>
            <div className="flex gap-3 pt-1">
              <button onClick={save} disabled={saving || !form.name.trim()} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg">
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add person'}
              </button>
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {deleteId && (
        <Modal title="Delete person?" onClose={() => setDeleteId(null)}>
          <p className="text-sm text-gray-600 mb-4">This will permanently remove the trusted person record.</p>
          <div className="flex gap-3">
            <button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded-lg">Delete</button>
            <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 rounded-lg">Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
