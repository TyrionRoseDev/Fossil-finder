import './FilterChips.css'

const CREATURE_FILTERS = [
  { label: '🦕 Dinosaurs', taxon: 'Dinosauria' },
  { label: '🦣 Mammals', taxon: 'Mammalia' },
  { label: '🐟 Fish', taxon: 'Osteichthyes' },
  { label: '🦈 Sharks & rays', taxon: 'Chondrichthyes' },
  { label: '🐚 Mollusks', taxon: 'Mollusca' },
  { label: '🦀 Trilobites', taxon: 'Trilobita' },
  { label: '🌿 Plants', taxon: 'Plantae' },
]

function FilterChips({ filters, onRemove, onOpenPanel, onQuickFilter }) {
  const activeFilters = []

  if (filters.taxon) {
    activeFilters.push({ key: 'taxon', label: filters.taxon })
  }
  if (filters.interval) {
    activeFilters.push({ key: 'interval', label: filters.interval })
  }
  if (filters.ageMin || filters.ageMax) {
    const label = `${filters.ageMax || '?'} – ${filters.ageMin || '?'} Ma`
    activeFilters.push({ key: 'age', label })
  }

  const hasActiveFilter = activeFilters.length > 0

  return (
    <div className="filter-chips">
      {/* Active filters */}
      {activeFilters.map(({ key, label }) => (
        <button key={key} className="filter-chip filter-chip-active" onClick={() => onRemove(key)}>
          {label}
          <span className="filter-chip-close">&times;</span>
        </button>
      ))}

      {/* Quick creature type buttons — show when no taxon filter is active */}
      {!filters.taxon && (
        CREATURE_FILTERS.map(({ label, taxon }) => (
          <button
            key={taxon}
            className="filter-chip filter-chip-quick"
            onClick={() => onQuickFilter(taxon)}
          >
            {label}
          </button>
        ))
      )}

      <button className="filter-chip filter-chip-add" onClick={onOpenPanel}>
        + Filters
      </button>
    </div>
  )
}

export default FilterChips
