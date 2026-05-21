interface Props {
  rows?: number
}

export default function SkeletonCard({ rows = 3 }: Props) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 px-4 py-3 animate-pulse">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex gap-2">
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="h-4 bg-gray-100 rounded w-20" />
              </div>
              <div className="h-3 bg-gray-100 rounded w-48" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
            <div className="flex gap-2 shrink-0">
              <div className="h-3 bg-gray-100 rounded w-8" />
              <div className="h-3 bg-gray-100 rounded w-10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
