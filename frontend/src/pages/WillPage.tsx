import { useEffect, useState } from 'react'
import SectionIntro from '../components/SectionIntro'
import { getWillRecord, upsertWillRecord, type WillRecord, type WillRecordRequest, type WillType } from '../api/will'
import { getTrustedPersons, type TrustedPerson } from '../api/trustedPersons'
import { FormField, inputCls, selectCls } from '../components/FormField'
import { useToastStore } from '../store/toastStore'

const WILL_TYPES: WillType[] = ['SINGLE', 'JOINT', 'NONE']

const blank: WillRecordRequest = { hasWill: false }

export default function WillPage() {
  const [willRecord, setWillRecord] = useState<WillRecord | null>(null)
  const [trustedPersons, setTrustedPersons] = useState<TrustedPerson[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<WillRecordRequest>(blank)
  const [saving, setSaving] = useState(false)
  const toast = useToastStore()

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
      toast.show(willRecord ? 'Will updated ✓' : 'Will saved ✓')
    } catch {
      toast.show('Failed to save Will record', 'error')
    } finally { setSaving(false) }
  }

  const set = (k: keyof WillRecordRequest, v: string | boolean | undefined) =>
    setForm(f => ({ ...f, [k]: v === '' ? undefined : v }))

  const executorName = trustedPersons.find(tp => tp.id === form.executorId)?.name

  if (loading) return (
    <div className="p-4 md:p-8 max-w-xl mx-auto">
      <div className="space-y-3 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32" />
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-4 bg-gray-200 rounded" />)}
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-4 md:p-8 max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">Will &amp; Estate</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-0.5">Document where your Will is stored and who your executor is.</p>
      </div>

      <SectionIntro sectionKey="will" note="Where your Will is kept, who your executor is, and the basic facts about it. This section does not replace a Will — it locates one. If you don't yet have a Will, this section can also act as a reminder to make one. Indian succession law treats a registered Will as the definitive instruction; nominations alone are not enough." />

      {/* E3: Status summary card — show when will is recorded */}
      {willRecord?.hasWill && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-600 text-lg">✓</span>
            <span className="text-sm font-semibold text-green-800">Will recorded</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-green-700">
            {willRecord.willType && (
              <><span className="text-green-500">Type</span><span>{willRecord.willType}</span></>
            )}
            {willRecord.location && (
              <><span className="text-green-500">Location</span><span className="truncate">{willRecord.location}</span></>
            )}
            {executorName && (
              <><span className="text-green-500">Executor</span><span>{executorName}</span></>
            )}
            {willRecord.registeredWith && (
              <><span className="text-green-500">Registered</span><span className="truncate">{willRecord.registeredWith}</span></>
            )}
            {willRecord.reviewReminderDate && (
              <><span className="text-green-500">Review date</span><span>{willRecord.reviewReminderDate}</span></>
            )}
          </div>
          <p className="text-xs text-green-500 mt-1">Last updated: {new Date(willRecord.updatedAt).toLocaleDateString('en-IN')}</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-5">
        <div className="flex items-center gap-3">
          <input
            id="hasWill"
            type="checkbox"
            checked={form.hasWill}
            onChange={e => setForm(f => ({ ...f, hasWill: e.target.checked }))}
            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="hasWill" className="text-sm font-medium text-gray-700 dark:text-gray-300">I have a Will</label>
        </div>

        {!form.hasWill && (
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 space-y-2">
            <h3 className="text-sm font-semibold text-amber-800">Why a Will matters</h3>
            <p className="text-xs text-amber-700 leading-relaxed">
              Without a Will, Indian succession law decides who inherits your assets —
              which may not reflect your wishes. Nominations on bank accounts and
              insurance policies do not override succession law for all assets.
              A registered Will is the definitive instruction.
            </p>
            <ul className="text-xs text-amber-700 list-disc list-inside space-y-1">
              <li>Protects your spouse and children</li>
              <li>Prevents disputes among family members</li>
              <li>Covers assets that nominations alone do not</li>
            </ul>
            <a
              href="#"
              className="inline-block mt-1 text-xs font-medium text-amber-900 underline hover:text-amber-700"
            >
              Get help drafting a Will →
            </a>
          </div>
        )}

        {form.hasWill && (
          <>
            <FormField label="Will Type">
              <select className={selectCls} value={form.willType ?? ''} onChange={e => set('willType', e.target.value as WillType)}>
                <option value="">— Select —</option>
                {WILL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Physical Location" hint="Where is the original Will document kept?">
              <input className={inputCls} value={form.location ?? ''} onChange={e => set('location', e.target.value)} placeholder="e.g. Safe at home, Bank locker" />
            </FormField>
            <FormField label="Executor (Trusted Person)" hint="The person responsible for carrying out the Will">
              <select className={selectCls} value={form.executorId ?? ''} onChange={e => set('executorId', e.target.value)}>
                <option value="">— None —</option>
                {trustedPersons.map(tp => <option key={tp.id} value={tp.id}>{tp.name}</option>)}
              </select>
            </FormField>
            <FormField label="Registered With" hint="e.g. Sub-Registrar Office, Notary — for a registered Will">
              <input className={inputCls} value={form.registeredWith ?? ''} onChange={e => set('registeredWith', e.target.value)} placeholder="e.g. Sub-Registrar Office, Notary" />
            </FormField>
            <FormField label="Review Reminder Date" hint="Set a date to review and update your Will">
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
        </div>
      </div>
    </div>
  )
}
