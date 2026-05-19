import { useEffect, useState } from 'react'
import { getWillRecord, upsertWillRecord, type WillRecord, type WillRecordRequest, type WillType } from '../api/will'
import { getTrustedPersons, type TrustedPerson } from '../api/trustedPersons'
import { FormField, inputCls, selectCls } from '../components/FormField'

const WILL_TYPES: WillType[] = ['SINGLE', 'JOINT', 'NONE']

const blank: WillRecordRequest = { hasWill: false }

export default function WillPage() {
  const [willRecord, setWillRecord] = useState<WillRecord | null>(null)
  const [trustedPersons, setTrustedPersons] = useState<TrustedPerson[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<WillRecordRequest>(blank)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    Promise.all([
      getWillRecord().catch(() => null),
      getTrustedPersons(),
    ]).then(([w, tp]) => {
      setTrustedPersons(tp.data)
      if (w?.data) {
        const r = w.data
        setWillRecord(r)
        setForm({
          hasWill: r.hasWill, willType: r.willType, location: r.location,
          executorId: r.executorId, registeredWith: r.registeredWith,
          reviewReminderDate: r.reviewReminderDate, notes: r.notes,
        })
      }
      setLoading(false)
    })
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const r = await upsertWillRecord(form)
      setWillRecord(r.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally { setSaving(false) }
  }

  const set = (k: keyof WillRecordRequest, v: string | boolean | undefined) =>
    setForm(f => ({ ...f, [k]: v === '' ? undefined : v }))

  if (loading) return <div className="p-4 md:p-8"><p className="text-sm text-gray-400">Loading…</p></div>

  return (
    <div className="p-4 md:p-8 max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Will &amp; Estate</h1>
        <p className="text-sm text-gray-500 mt-0.5">Document where your Will is stored and who your executor is.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-5">
        <div className="flex items-center gap-3">
          <input
            id="hasWill"
            type="checkbox"
            checked={form.hasWill}
            onChange={e => setForm(f => ({ ...f, hasWill: e.target.checked }))}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="hasWill" className="text-sm font-medium text-gray-700">I have a Will</label>
        </div>

        {form.hasWill && (
          <>
            <FormField label="Will Type">
              <select className={selectCls} value={form.willType ?? ''} onChange={e => set('willType', e.target.value as WillType)}>
                <option value="">— Select —</option>
                {WILL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Physical Location">
              <input className={inputCls} value={form.location ?? ''} onChange={e => set('location', e.target.value)} placeholder="e.g. Safe at home, Bank locker" />
            </FormField>
            <FormField label="Executor (Trusted Person)">
              <select className={selectCls} value={form.executorId ?? ''} onChange={e => set('executorId', e.target.value)}>
                <option value="">— None —</option>
                {trustedPersons.map(tp => <option key={tp.id} value={tp.id}>{tp.name}</option>)}
              </select>
            </FormField>
            <FormField label="Registered With">
              <input className={inputCls} value={form.registeredWith ?? ''} onChange={e => set('registeredWith', e.target.value)} placeholder="e.g. Sub-Registrar Office, Notary" />
            </FormField>
            <FormField label="Review Reminder Date">
              <input className={inputCls} type="date" value={form.reviewReminderDate ?? ''} onChange={e => set('reviewReminderDate', e.target.value)} />
            </FormField>
          </>
        )}

        <FormField label="Notes">
          <textarea className={inputCls} rows={3} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} placeholder="Any notes for your family about the estate…" />
        </FormField>

        <div className="flex items-center gap-3">
          <button onClick={save} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg">
            {saving ? 'Saving…' : willRecord ? 'Update' : 'Save'}
          </button>
          {saved && <span className="text-sm text-green-600">Saved ✓</span>}
        </div>
      </div>

      {willRecord && (
        <p className="text-xs text-gray-400 mt-3 text-right">Last updated: {new Date(willRecord.updatedAt).toLocaleDateString('en-IN')}</p>
      )}
    </div>
  )
}
