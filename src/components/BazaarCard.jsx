import { Link } from 'react-router-dom'

function formatTime(timeStr) {
  if (!timeStr) return '–'
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'pm' : 'am'
  const hour12 = hour % 12 || 12
  return `${hour12}:${m} ${ampm}`
}

export default function BazaarCard({ bazaar, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border transition-all cursor-pointer hover:shadow-md ${
        isSelected
          ? 'border-forest shadow-md ring-1 ring-forest'
          : 'border-gray-100 shadow-sm'
      }`}
    >
      <div className="p-4">

        {/* Name + verified badge */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-s leading-snug">{bazaar.name}</h3>
          {bazaar.is_verified && (
            <span className="shrink-0 text-[10px] bg-green-50 text-forest border border-green-200 rounded-full px-2 py-0.5 font-medium">
              ✓ Verified
            </span>
          )}
        </div>

        {/* Area */}
        <p className="text-sm text-gray-400 mb-2">{bazaar.area}</p>

        {/* Address */}
        <p className="text-sm text-gray-500 leading-relaxed mb-3 line-clamp-2">
          {bazaar.address}
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-3">
          {bazaar.opening_time && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTime(bazaar.opening_time)} – {formatTime(bazaar.closing_time)}
            </span>
          )}
          {bazaar.stall_count && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {bazaar.stall_count} stalls
            </span>
          )}
          {bazaar.parliament && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {bazaar.parliament}
            </span>
          )}
        </div>

        {/* Detail link */}
        <Link
          to={`/bazaar/${bazaar.id}`}
          onClick={e => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:text-green-900 transition-colors"
        >
          View details
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

      </div>
    </div>
  )
}