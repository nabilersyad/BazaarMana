import { useState, useEffect } from 'react'

export default function SearchFilter({ bazaars, onFilter }) {
  const [search, setSearch] = useState('')
  const [area, setArea] = useState('')
  const [parliament, setParliament] = useState('')

  // Build unique dropdown options from the data
  const areas = [...new Set(bazaars.map(b => b.area).filter(Boolean))].sort()
  const parliaments = [...new Set(bazaars.map(b => b.parliament).filter(Boolean))].sort()

  // Re-filter whenever search terms or data changes
  useEffect(() => {
    let results = bazaars

    if (search) {
      const q = search.toLowerCase()
      results = results.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q) ||
        (b.area && b.area.toLowerCase().includes(q))
      )
    }

    if (area) results = results.filter(b => b.area === area)
    if (parliament) results = results.filter(b => b.parliament === parliament)

    onFilter(results)
  }, [search, area, parliament, bazaars])

  const hasFilters = search || area || parliament

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">

      {/* Search input */}
      <div className="relative mb-3">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by name or area..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent"
        />
      </div>

      {/* Dropdowns */}
      <div className="flex gap-2">
        <select
          value={area}
          onChange={e => setArea(e.target.value)}
          className="flex-1 py-2 px-3 text-sm text-gray-600 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest bg-white"
        >
          <option value="">All Areas</option>
          {areas.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        <select
          value={parliament}
          onChange={e => setParliament(e.target.value)}
          className="flex-1 py-2 px-3 text-sm text-gray-600 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest bg-white"
        >
          <option value="">All Parlimens</option>
          {parliaments.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={() => { setSearch(''); setArea(''); setParliament('') }}
          className="mt-2 text-xs text-forest hover:text-green-900 font-medium flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear filters
        </button>
      )}
    </div>
  )
}