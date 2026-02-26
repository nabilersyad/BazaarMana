import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import L from 'leaflet'

// Fix broken default icons in Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  //shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const greenIcon = new L.Icon({
  iconUrl: '/icons/MapIconGreen.png',
  //shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [1, -40],
  //shadowSize: [40, 40],
})

const goldIcon = new L.Icon({
  iconUrl: '/icons/MapIconGold.png',
  //shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [1, -40],
  //shadowSize: [40, 40],
})

function formatTime(timeStr) {
  if (!timeStr) return '–'
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'pm' : 'am'
  const hour12 = hour % 12 || 12
  return `${hour12}:${m} ${ampm}`
}

// Flies the map to the selected bazaar
function FlyToSelected({ selected }) {
  const map = useMap()
  useEffect(() => {
    if (selected) {
      map.flyTo([selected.lat, selected.lng], 15, { duration: 0.8 })
    }
  }, [selected, map])
  return null
}

export default function BazaarMap({ bazaars, selected, onSelect }) {
  const center = [3.1478, 101.6953] // KL centre

  return (
    <MapContainer
      center={center}
      zoom={12}
      className="w-full h-full"
      style={{ minHeight: '400px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://hot.openstreetmap.org">HOT</a>'
        url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
      />

      <FlyToSelected selected={selected} />

      {bazaars.map(bazaar => (
        <Marker
          key={bazaar.id}
          position={[bazaar.lat, bazaar.lng]}
          icon={selected?.id === bazaar.id ? goldIcon : greenIcon}
          eventHandlers={{ click: () => onSelect(bazaar) }}
        >
          <Popup maxWidth={220}>
            <div className="py-1">
              <p className="font-semibold text-sm text-gray-900 mb-1 leading-snug">{bazaar.name}</p>
              <p className="text-xs text-gray-500 mb-2 leading-relaxed">{bazaar.address}</p>
              {bazaar.opening_time && (
                <p className="text-xs text-gray-600 mb-2">
                  🕐 {formatTime(bazaar.opening_time)} – {formatTime(bazaar.closing_time)}
                </p>
              )}
              {bazaar.stall_count && (
                <p className="text-xs text-gray-600 mb-2">🛒 {bazaar.stall_count} stalls</p>
              )}
              <Link
                to={`/bazaar/${bazaar.id}`}
                className="leaflet-link-btn inline-block text-xs bg-forest text-white rounded-lg px-3 py-1.5 font-medium hover:bg-green-800 transition-colors"
              >
                View details →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}