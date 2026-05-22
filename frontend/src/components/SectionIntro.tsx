interface SectionIntroProps {
  note: string
}

/** Subtle info banner shown at the top of every section page.
 *  Gives first-time users (and family members in an emergency) context
 *  about what this section is for and why it matters. */
export default function SectionIntro({ note }: SectionIntroProps) {
  return (
    <div className="flex items-start gap-2.5 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 mb-5 text-sm text-indigo-700 leading-relaxed">
      <span className="mt-0.5 shrink-0 text-indigo-400">ℹ</span>
      <p>{note}</p>
    </div>
  )
}
