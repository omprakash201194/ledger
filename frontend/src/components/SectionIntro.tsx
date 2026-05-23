import { useState, useEffect } from 'react'

interface SectionIntroProps {
  /** Unique key used to persist the dismissed state (e.g. "home", "assets"). */
  sectionKey: string
  note: string
}

/** Dismissible info banner shown at the top of every section page.
 *  Dismissed state is persisted per-section in localStorage. */
export default function SectionIntro({ sectionKey, note }: SectionIntroProps) {
  const storageKey = `sectionIntro:${sectionKey}`
  const [dismissed, setDismissed] = useState<boolean | null>(null)

  useEffect(() => {
    setDismissed(localStorage.getItem(storageKey) === 'dismissed')
  }, [storageKey])

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem(storageKey, 'dismissed')
  }

  if (dismissed !== false) return null

  return (
    <div className="flex items-start gap-2.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-xl px-4 py-3 mb-5 text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
      <span className="mt-0.5 shrink-0 text-indigo-400 dark:text-indigo-500">ℹ</span>
      <p className="flex-1">{note}</p>
      <button
        onClick={handleDismiss}
        className="mt-0.5 shrink-0 text-indigo-400 dark:text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}
