import type { ReactNode } from 'react'

interface Props {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: ReactNode
}

export function FormField({ label, required, hint, error, children }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

export const inputCls = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
export const selectCls = inputCls + ' bg-white dark:bg-gray-900'
