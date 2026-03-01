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
  const [unverified, setUnverified] = useState([])

  useEffect(() => {
    async function fetchBazaars() {
      // Run both queries simultaneously instead of one after the other
      // Promise.all waits for both to finish before continuing
      const [
        { data: verified, error: verifiedError },
        { data: unverified, error: unverifiedError }
      ] = await Promise.all([

        // Query 1: fetch verified bazaars for the main map pins
        supabase
          .from('bazaars')
          .select('*')
          .eq('is_active', true)
          .eq('is_verified', true)
          .order('name'),

        // Query 2: fetch unverified bazaars for the grey "pending" pins
        supabase
          .from('bazaars')
          .select('*')
          .eq('is_active', true)
          .eq('is_verified', false)
          .order('name'),

      ])

      if (!verifiedError && verified) {
        setBazaars(verified)      // full verified list, 
      }

      if (!unverifiedError && unverified) {
        setUnverified(unverified) // unverified list, passed directly to map
      }

       // Combine both for the list, verified first
      if (!verifiedError && !unverifiedError) {
        setFiltered([...(verified || []), ...(unverified || [])])
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
          Kuala Lumpur & Selangor — {bazaars.length} verified · {unverified.length} pending
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
          <SearchFilter bazaars={[...bazaars, ...unverified]} onFilter={setFiltered} />
          <BazaarList bazaars={filtered} selected={selected} onSelect={handleSelect} />
        </div>

        {/* Map panel */}
        <div className={`
          flex-1
          ${mobileView === 'list' ? 'hidden md:block' : 'block'}
        `}>
          <BazaarMap
            bazaars={filtered.filter(b => b.is_verified)}
            unverified={filtered.filter(b => !b.is_verified)}
            selected={selected}
            onSelect={handleSelect}
          />
        </div>

      </div>
    </div>
  )
}