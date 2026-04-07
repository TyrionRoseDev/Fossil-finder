import { useState } from 'react'
import './FilterPanel.css'

const MAJOR_TAXA = [
  'Dinosauria',
  'Mammalia',
  'Plantae',
  'Mollusca',
  'Arthropoda',
  'Pisces',
  'Amphibia',
  'Reptilia',
  'Aves',
]

const GEOLOGICAL_PERIODS = [
  'Cambrian',
  'Ordovician',
  'Silurian',
  'Devonian',
  'Carboniferous',
  'Permian',
  'Triassic',
  'Jurassic',
  'Cretaceous',
  'Paleogene',
  'Neogene',
  'Quaternary',
]

function FilterPanel({ filters, onApply, onClose }) {
  const [localFilters, setLocalFilters] = useState({ ...filters })

  function handleTaxonClick(taxon) {
    setLocalFilters((prev) => ({
      ...prev,
      taxon: prev.taxon === taxon ? '' : taxon,
    }))
  }

  function handlePeriodChange(e) {
    setLocalFilters((prev) => ({
      ...prev,
      interval: e.target.value,
    }))
  }

  function handleApply() {
    onApply(localFilters)
    onClose()
  }

  function handleClear() {
    const cleared = { taxon: '', interval: '', ageMin: '', ageMax: '' }
    setLocalFilters(cleared)
    onApply(cleared)
    onClose()
  }

  return (
    <div className="filter-panel-overlay" onClick={onClose}>
      <div className="filter-panel glass" onClick={(e) => e.stopPropagation()}>
        <div className="filter-panel-accent accent-line" />

        <div className="filter-panel-header">
          <h3 className="filter-panel-title">Filters</h3>
          <button className="filter-panel-close" onClick={onClose}>&times;</button>
        </div>

        {/* Taxon filter */}
        <div className="filter-panel-section">
          <div className="label">Organism Group</div>
          <div className="filter-panel-taxa">
            {MAJOR_TAXA.map((taxon) => (
              <button
                key={taxon}
                className={`filter-panel-taxon ${localFilters.taxon === taxon ? 'active' : ''}`}
                onClick={() => handleTaxonClick(taxon)}
              >
                {taxon}
              </button>
            ))}
          </div>
        </div>

        {/* Period dropdown */}
        <div className="filter-panel-section">
          <div className="label">Geological Period</div>
          <select
            className="filter-panel-select"
            value={localFilters.interval}
            onChange={handlePeriodChange}
          >
            <option value="">All periods</option>
            {GEOLOGICAL_PERIODS.map((period) => (
              <option key={period} value={period}>{period}</option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="filter-panel-actions">
          <button className="filter-panel-clear" onClick={handleClear}>
            Clear All
          </button>
          <button className="filter-panel-apply" onClick={handleApply}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}

export default FilterPanel
