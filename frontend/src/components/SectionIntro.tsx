import { useState } from 'react'

interface SectionIntroProps {
  /** Unique key (unused now — kept for API compatibility). */
  sectionKey: string
  note: string
}

/** Dismissible info banner shown at the top of every section page.
 *  Dismissed for the current session only — reappears on next page load. */
export default function SectionIntro({ note }: SectionIntroProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="flex items-start gap-2.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-xl px-4 py-3 mb-5 text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
      <span className="mt-0.5 shrink-0 text-indigo-400 dark:text-indigo-500">ℹ</span>
      <p className="flex-1">{note}</p>
      <button
        onClick={() => setDismissed(true)}
        className="mt-0.5 shrink-0 text-indigo-400 dark:text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}
