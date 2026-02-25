import BazaarCard from './BazaarCard'

export default function BazaarList({ bazaars, selected, onSelect }) {
  if (bazaars.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">🔍</div>
        <p className="text-sm text-gray-500">No bazaars found</p>
        <p className="text-xs text-gray-400 mt-1">Try a different search or filter</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400 font-medium px-1">
        {bazaars.length} bazaar{bazaars.length !== 1 ? 's' : ''} found
      </p>
      {bazaars.map(bazaar => (
        <BazaarCard
          key={bazaar.id}
          bazaar={bazaar}
          isSelected={selected?.id === bazaar.id}
          onClick={() => onSelect(bazaar)}
        />
      ))}
    </div>
  )
}