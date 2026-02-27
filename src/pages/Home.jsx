import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import BazaarMap from '../components/BazaarMap'
import BazaarList from '../components/BazaarList'
import SearchFilter from '../components/SearchFilter'

export default function Home() {
  const [bazaars, setBazaars] = useState([])
  const [filtered, setFiltered] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mobileView, setMobileView] = useState('map') // 'map' or 'list'

  useEffect(() => {
    async function fetchBazaars() {
      const { data, error } = await supabase
        .from('bazaars')
        .select('*')
        .eq('is_active', true)
        .eq('is_verified', true)
        .order('name')

      if (!error && data) {
        setBazaars(data)
        setFiltered(data)
      }
      setLoading(false)
    }
    fetchBazaars()
  }, [])

  const handleSelect = (bazaar) => {
    setSelected(prev => prev?.id === bazaar.id ? null : bazaar)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <img src="/BazaarManaLogo.svg" alt="BazaarMana" className="h-12 w-12 mx-auto mb-3 animate-pulse" />
          {/*<div className="text-4xl mb-3 animate-pulse">☽</div>*/}
          <p className="text-sm text-gray-400">Loading bazaars...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">

      {/* Header */}
      <div className="bg-forest text-white py-3 px-4 text-center shrink-0">
        <h1 className="font-display text-lg font-bold">Ramadan Bazaars 2026</h1>
        <p className="text-green-200 text-xs mt-0.5">
          Kuala Lumpur — {bazaars.length} verified bazaars
        </p>
      </div>

      {/* Mobile toggle */}
      <div className="md:hidden flex bg-white border-b border-gray-100 shrink-0">
        {['map', 'list'].map(v => (
          <button
            key={v}
            onClick={() => setMobileView(v)}
            className={`flex-1 py-2.5 text-sm font-medium capitalize transition-colors ${
              mobileView === v
                ? 'text-forest border-b-2 border-forest'
                : 'text-gray-400'
            }`}
          >
            {v === 'map' ? '🗺 Map' : '📋 List'}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">

        {/* List panel */}
        <div className={`
          w-full md:w-[480px] shrink-0 flex flex-col
          bg-cream overflow-y-auto px-3 py-3
          ${mobileView === 'map' ? 'hidden md:flex' : 'flex'}
        `}>
          <SearchFilter bazaars={bazaars} onFilter={setFiltered} />
          <BazaarList bazaars={filtered} selected={selected} onSelect={handleSelect} />
        </div>

        {/* Map panel */}
        <div className={`
          flex-1
          ${mobileView === 'list' ? 'hidden md:block' : 'block'}
        `}>
          <BazaarMap
            bazaars={filtered}
            selected={selected}
            onSelect={handleSelect}
          />
        </div>

      </div>
    </div>
  )
}