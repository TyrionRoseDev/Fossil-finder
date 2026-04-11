import { useState } from 'react'
import './FavoritesMenu.css'

function FavoritesMenu({ favorites, onSelect, onRemove }) {
  const [open, setOpen] = useState(false)
  const count = favorites.length

  return (
    <div className="favorites-wrapper">
      <button
        className="favorites-button"
        onClick={() => setOpen(!open)}
      >
        <span className="favorites-icon">{open ? '✕' : '♡'}</span>
        {count > 0 && <span className="favorites-count">{count}</span>}
      </button>

      {open && (
        <div className="favorites-dropdown">
          <div className="favorites-header">
            Saved fossils
          </div>
          {count === 0 ? (
            <div className="favorites-empty">
              No saved fossils yet. Click the heart on a fossil to save it here.
            </div>
          ) : (
            <ul className="favorites-list">
              {favorites.map((f) => (
                <li
                  key={f.occurrence_no}
                  className="favorites-item"
                  onClick={() => {
                    onSelect(f)
                    setOpen(false)
                  }}
                >
                  <div className="favorites-item-info">
                    <span className="favorites-item-name">{f.accepted_name}</span>
                    <span className="favorites-item-meta">
                      {f.early_interval}
                      {f.max_ma && f.min_ma ? ` · ${f.max_ma}–${f.min_ma} Ma` : ''}
                    </span>
                  </div>
                  <button
                    className="favorites-item-remove"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemove(f)
                    }}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default FavoritesMenu
