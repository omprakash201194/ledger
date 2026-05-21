import { useToastStore } from '../store/toastStore'

export default function Toast() {
  const { message, type, dismiss } = useToastStore()

  if (!message) return null

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={dismiss}
      className={`fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[60]
        flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium
        cursor-pointer select-none whitespace-nowrap
        ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
    >
      <span>{type === 'success' ? '✓' : '✕'}</span>
      <span>{message}</span>
    </div>
  )
}
