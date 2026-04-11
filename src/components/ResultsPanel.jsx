import { useState, useEffect, memo } from 'react'
import './ResultsPanel.css'

function ResultsPanel({ fossils, isClustered, onSelect, searchTaxon }) {
  const [open, setOpen] = useState(false)

  // Auto-open when results first arrive
  useEffect(() => {
    if (!isClustered && fossils.length > 0) setOpen(true)
  }, [fossils, isClustered])

  if (isClustered || fossils.length === 0) return null

  return (
    <div className="results-panel">
      <button
        className="results-panel-toggle"
        onClick={() => setOpen(!open)}
      >
        {open ? '\u25BC' : '\u25B2'} RESULTS
        <span className="results-panel-toggle-count">{fossils.length}</span>
      </button>

      {open && (
        <div className="results-panel-body">
          {searchTaxon && (
            <div className="results-panel-search-header">
              Showing fossils related to <strong>{searchTaxon}</strong>
            </div>
          )}
          <ul className="results-panel-list">
            {fossils.map((fossil) => (
              <li
                key={fossil.occurrence_no}
                className="results-panel-item"
                onClick={() => onSelect(fossil)}
              >
                <div className="results-panel-item-dot" />
                <div className="results-panel-item-info">
                  <div className="results-panel-item-name">
                    {fossil.accepted_name || fossil.identified_name || 'Unknown'}
                  </div>
                  <div className="results-panel-item-meta">
                    {fossil.early_interval || 'Unknown period'}
                    {fossil.cc ? ` \u00B7 ${fossil.cc}` : ''}
                  </div>
                </div>
                <div className="results-panel-item-age">
                  {fossil.max_ma != null && fossil.min_ma != null && fossil.max_ma > 0
                    ? `${fossil.max_ma}\u2013${fossil.min_ma} Ma`
                    : ''}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default memo(ResultsPanel)
