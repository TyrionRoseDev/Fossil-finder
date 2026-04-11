import { useState, useEffect } from 'react'
import { fetchWikipediaSummary } from '../api/wikipedia'
import './SpeciesPage.css'

function SpeciesPage({ fossil, creatureType, onClose, onBack }) {
  const [wiki, setWiki] = useState(null)
  const [loading, setLoading] = useState(true)

  const name = fossil.accepted_name || fossil.identified_name || 'Unknown'
  const genus = name.split(' ')[0]

  useEffect(() => {
    setLoading(true)
    setWiki(null)

    fetchWikipediaSummary(name).then((data) => {
      setWiki(data)
      setLoading(false)
    })
  }, [name])

  return (
    <div className="species-page-overlay" onClick={onClose}>
      <div className="species-page" onClick={(e) => e.stopPropagation()}>
        <div className="species-page-nav">
          <button className="species-page-back" onClick={onBack}>
            ← Back
          </button>
          <button className="species-page-close" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Hero image */}
        {wiki?.image ? (
          <div className="species-page-hero">
            <img
              src={wiki.image}
              alt={genus}
              className="species-page-hero-img"
            />
            <div className="species-page-hero-gradient" />
          </div>
        ) : (
          <div className="species-page-no-hero" />
        )}

        <div className="species-page-content">
          {/* Title */}
          <div className="species-page-header">
            <h1 className="species-page-name">{genus}</h1>
            <div className="species-page-scientific">{name}</div>
            {creatureType && (
              <div className="species-page-creature">{creatureType}</div>
            )}
          </div>

          {/* Quick facts */}
          <div className="species-page-facts">
            {fossil.early_interval && (
              <div className="species-page-fact">
                <span className="species-page-fact-label">Time period</span>
                <span className="species-page-fact-value">{fossil.early_interval}</span>
              </div>
            )}
            {fossil.max_ma && fossil.min_ma && (
              <div className="species-page-fact">
                <span className="species-page-fact-label">Lived</span>
                <span className="species-page-fact-value">
                  {fossil.max_ma}–{fossil.min_ma} million years ago
                </span>
              </div>
            )}
            {fossil.phylum && (
              <div className="species-page-fact">
                <span className="species-page-fact-label">Group</span>
                <span className="species-page-fact-value">{fossil.phylum}</span>
              </div>
            )}
            {fossil.family && (
              <div className="species-page-fact">
                <span className="species-page-fact-label">Family</span>
                <span className="species-page-fact-value">{fossil.family}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {loading && (
            <div className="species-page-loading">
              <div className="species-page-loading-dot" />
              Loading information...
            </div>
          )}

          {!loading && wiki?.extract && (
            <div className="species-page-description">
              <div className="species-page-section-title">About</div>
              <p className="species-page-text">{wiki.extract}</p>
            </div>
          )}

          {!loading && !wiki && (
            <div className="species-page-no-data">
              No Wikipedia article found for this species. Try searching for "{genus}" online for more information.
            </div>
          )}

          {/* Source link */}
          {wiki?.pageUrl && (
            <a
              className="species-page-wiki-link"
              href={wiki.pageUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Read full article on Wikipedia ↗
            </a>
          )}

          {/* PBDB link */}
          <a
            className="species-page-pbdb-link"
            href={`https://paleobiodb.org/navigator/#/taxon_no=${fossil.accepted_no || fossil.identified_no}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View scientific record on PBDB ↗
          </a>
        </div>
      </div>
    </div>
  )
}

export default SpeciesPage
