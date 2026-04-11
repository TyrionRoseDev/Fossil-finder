import './FilterChips.css'

function FilterChips({ filters, onRemove, onOpenPanel }) {
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

  return (
    <div className="filter-chips">
      {activeFilters.map(({ key, label }) => (
        <button key={key} className="filter-chip glass" onClick={() => onRemove(key)}>
          {label}
          <span className="filter-chip-close">&times;</span>
        </button>
      ))}
      <button className="filter-chip filter-chip-add" onClick={onOpenPanel}>
        + Filters
      </button>
    </div>
  )
}

export default FilterChips
