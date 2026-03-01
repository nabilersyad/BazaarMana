import { useState, useEffect } from 'react'

export default function SearchFilter({ bazaars, onFilter }) {
  const [search, setSearch] = useState('')
  const [neighbourhood, setNeighbourhood] = useState('')
  const [area, setArea] = useState('')
  const [state, setState] = useState('')

  // Build unique dropdown options from the data
  const neighbourhoods = [...new Set(bazaars.map(b => b.area).filter(Boolean))].sort()
  const areas = [...new Set(bazaars.map(b => b.parliament).filter(Boolean))].sort()
  const states = [...new Set(bazaars.map(b => b.state).filter(Boolean))].sort()

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

    if (neighbourhood) results = results.filter(b => b.area === neighbourhood)
    if (area) results = results.filter(b => b.parliament === area)
    if (state) results = results.filter(b => b.state === state)

    onFilter(results)
  }, [search, neighbourhood, area, state])

  const hasFilters = search || neighbourhood || area || state

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

      {/* Dropdowns — stacked vertically */}
      <div className="flex flex-col gap-2">
        <select
          value={state}
          onChange={e => setState(e.target.value)}
          className="w-full py-2 px-3 text-xs text-gray-600 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest bg-white"
        >
          <option value="">All States</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={area}
          onChange={e => setArea(e.target.value)}
          className="w-full py-2 px-3 text-xs text-gray-600 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest bg-white"
        >
          <option value="">All Areas</option>
          {areas.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        <select
          value={neighbourhood}
          onChange={e => setNeighbourhood(e.target.value)}
          className="w-full py-2 px-3 text-xs text-gray-600 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest bg-white"
        >
          <option value="">All Neighbourhoods</option>
          {neighbourhoods.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={() => { setSearch(''); setNeighbourhood(''); setArea(''); setState('') }}
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