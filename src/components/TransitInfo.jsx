import { useState, useEffect } from 'react'
import { transitSupabase } from '../lib/transitSupabase'

function walkLabel(seconds) {
  const mins = Math.round(seconds / 60)
  return `Less than ${mins} min walk`
}

export default function TransitInfo({ lat, lng }) {
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStations() {
      const { data, error } = await transitSupabase.rpc('get_nearby_stations', {
        point_lat: lat,
        point_lng: lng,
      })
      if (!error && data) setStations(data)
      setLoading(false)
    }
    fetchStations()
  }, [lat, lng])

  if (loading) {
    return (
      <div className="text-sm text-gray-400 animate-pulse py-2">
        Checking transit access...
      </div>
    )
  }

  if (stations.length === 0) {
    return (
      <div className="flex items-start gap-3 py-2">
        <span className="text-xl">🚶</span>
        <div>
          <p className="text-sm font-medium text-gray-700">No transit within 15 min walk</p>
          <p className="text-xs text-gray-400 mt-0.5">This bazaar is best accessed by car or bus</p>
        </div>
      </div>
    )
  }

  // Group stations by route
  const grouped = stations.reduce((acc, s) => {
    if (!acc[s.route_name]) acc[s.route_name] = []
    acc[s.route_name].push(s)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([routeName, stops]) => (
        <div key={routeName}>
          {/* Line header */}
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: stops[0].colour_hex_code }}
            />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {routeName}
            </p>
          </div>

          {/* Stations */}
          <div className="space-y-2 pl-5">
            {stops.sort((a, b) => a.walk_seconds - b.walk_seconds).map(s => (
              <div key={s.station_code} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded text-white"
                    style={{ backgroundColor: s.colour_hex_code }}
                  >
                    {s.station_code}
                  </span>
                  <span className="text-sm text-gray-800">{s.station_name}</span>
                </div>
                <span className="text-xs text-gray-400 shrink-0 ml-2">
                  {walkLabel(s.walk_seconds)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}