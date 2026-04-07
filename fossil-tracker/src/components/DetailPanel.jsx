import { useState, useEffect } from 'react'
import { fetchTaxonDetail } from '../api/pbdb'
import './DetailPanel.css'

function DetailPanel({ fossil, onClose, isFavorite, onToggleFavorite }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!fossil) return

    let cancelled = false
    setLoading(true)

    const name = fossil.accepted_name || fossil.identified_name
    if (name) {
      fetchTaxonDetail(name).then((data) => {
        if (!cancelled) {
          setDetail(data)
          setLoading(false)
        }
      }).catch(() => {
        if (!cancelled) setLoading(false)
      })
    }

    return () => { cancelled = true }
  }, [fossil])

  if (!fossil) return null

  const name = fossil.accepted_name || fossil.identified_name || 'Unknown'
  const location = [fossil.state, fossil.cc].filter(Boolean).join(', ')

  const taxonomy = [
    ['Phylum', fossil.phylum],
    ['Class', fossil.class],
    ['Order', fossil.order === 'NO_ORDER_SPECIFIED' ? null : fossil.order],
    ['Family', fossil.family],
    ['Genus', fossil.genus],
  ].filter(([, v]) => v)

  const ecologyTags = detail
    ? [detail.diet, detail.life_habit, detail.motility, detail.taxon_environment]
        .filter(Boolean)
        .flatMap(tag => tag.split(', '))
    : []

  return (
    <div className="detail-panel-overlay" onClick={onClose}>
      <div className="detail-panel glass" onClick={(e) => e.stopPropagation()}>
        <div className="detail-panel-accent accent-line" />

        <button className="detail-panel-close" onClick={onClose}>&times;</button>

        {/* Header */}
        <div className="detail-panel-header">
          <div className="label">{fossil.early_interval || 'Unknown Period'}</div>
          <h2 className="detail-panel-name">{name}</h2>
          {fossil.identified_name && fossil.identified_name !== name && (
            <div className="detail-panel-alt-name">{fossil.identified_name}</div>
          )}
        </div>

        {/* Key facts */}
        <div className="detail-panel-facts">
          <div className="detail-panel-fact">
            <div className="label">Era</div>
            <div className="detail-panel-fact-value">
              {detail?.early_interval || fossil.early_interval || '—'}
            </div>
          </div>
          <div className="detail-panel-fact">
            <div className="label">Period</div>
            <div className="detail-panel-fact-value">
              {detail?.late_interval || fossil.early_interval || '—'}
            </div>
          </div>
          <div className="detail-panel-fact">
            <div className="label">Age</div>
            <div className="detail-panel-fact-value">
              {fossil.max_ma && fossil.min_ma ? `${fossil.max_ma}–${fossil.min_ma} Ma` : '—'}
            </div>
          </div>
        </div>

        {/* Taxonomy */}
        {taxonomy.length > 0 && (
          <div className="detail-panel-section">
            <div className="label">Classification</div>
            <div className="detail-panel-taxonomy">
              {taxonomy.map(([rank, value]) => (
                <div key={rank} className="detail-panel-taxonomy-row">
                  <span className="detail-panel-taxonomy-rank">{rank}</span>
                  <span className="detail-panel-taxonomy-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discovery site */}
        <div className="detail-panel-section">
          <div className="label">Discovery Site</div>
          {fossil.formation && (
            <div className="detail-panel-site-name">{fossil.formation}</div>
          )}
          {location && <div className="detail-panel-site-location">{location}</div>}
          <div className="detail-panel-site-coords">
            {fossil.lat.toFixed(2)}&deg;N, {fossil.lng.toFixed(2)}&deg;W
          </div>
        </div>

        {/* Ecology tags */}
        {ecologyTags.length > 0 && (
          <div className="detail-panel-section">
            <div className="label">Ecology</div>
            <div className="detail-panel-tags">
              {ecologyTags.map((tag) => (
                <span key={tag} className="detail-panel-tag">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Loading state for extra detail */}
        {loading && (
          <div className="detail-panel-loading">Loading details...</div>
        )}

        {/* Actions */}
        <div className="detail-panel-actions">
          <button
            className="detail-panel-action"
            onClick={() => onToggleFavorite(fossil.occurrence_no)}
          >
            {isFavorite ? '\u2665 SAVED' : '\u2661 SAVE'}
          </button>
          <a
            className="detail-panel-action"
            href={`https://paleobiodb.org/classic/checkTaxonInfo?taxon_no=${fossil.accepted_no || fossil.identified_no}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            &#8599; PBDB
          </a>
        </div>
      </div>
    </div>
  )
}

export default DetailPanel
