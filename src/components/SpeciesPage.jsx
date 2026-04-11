import { useState, useEffect, useMemo } from 'react'
import { fetchWikipediaSummary } from '../api/wikipedia'
import { fetchTaxonDetail } from '../api/pbdb'
import './SpeciesPage.css'

// Same friendly group mapping as DetailPanel
function getFriendlyGroup(phylum, className) {
  const p = (phylum || '').toLowerCase()
  const c = (className || '').toLowerCase()
  if (p === 'chordata') {
    if (c === 'mammalia') return 'Mammal'
    if (c === 'reptilia') return 'Reptile'
    if (c === 'saurischia' || c === 'ornithischia' || c === 'dinosauria') return 'Dinosaur'
    if (c === 'aves') return 'Bird'
    if (c === 'amphibia') return 'Amphibian'
    if (c === 'actinopterygii' || c === 'osteichthyes') return 'Bony fish'
    if (c === 'chondrichthyes') return 'Shark / ray'
    return 'Vertebrate'
  }
  if (p === 'arthropoda') {
    if (c === 'trilobita') return 'Trilobite'
    if (c === 'insecta') return 'Insect'
    return 'Arthropod'
  }
  if (p === 'mollusca') {
    if (c === 'bivalvia') return 'Clam / mussel'
    if (c === 'gastropoda') return 'Snail'
    if (c === 'cephalopoda') return 'Squid / octopus relative'
    return 'Mollusk'
  }
  if (p === 'echinodermata') return 'Echinoderm'
  if (p === 'brachiopoda') return 'Brachiopod'
  if (p === 'cnidaria') return 'Coral / jellyfish'
  if (p === 'porifera') return 'Sponge'
  if (p === 'tracheophyta' || p === 'plantae') return 'Plant'
  return phylum || 'Unknown'
}

function buildLifestyleText(detail) {
  if (!detail) return null
  const parts = []

  // Diet
  const diet = (detail.diet || '').toLowerCase()
  if (diet.includes('carniv')) parts.push('It was a meat-eater, feeding on other animals.')
  else if (diet.includes('herbiv')) parts.push('It was a plant-eater.')
  else if (diet.includes('omniv')) parts.push('It ate both plants and animals.')
  else if (diet.includes('suspension') || diet.includes('filter')) parts.push('It fed by filtering tiny organisms from the water.')
  else if (diet.includes('deposit')) parts.push('It fed on organic particles found in sediment.')
  else if (diet) parts.push(`Its diet: ${detail.diet}.`)

  // Habitat
  const habit = (detail.life_habit || '').toLowerCase()
  if (habit.includes('arboreal')) parts.push('It lived in trees.')
  else if (habit.includes('ground')) parts.push('It was a ground-dwelling creature.')
  else if (habit.includes('fossorial')) parts.push('It lived in underground burrows.')
  else if (habit.includes('epifaunal')) parts.push('It lived on the surface of the sea floor.')
  else if (habit.includes('infaunal')) parts.push('It lived buried in the sediment of the ocean floor.')
  else if (habit.includes('pelagic') || habit.includes('nektonic')) parts.push('It swam freely through open water.')
  else if (habit) parts.push(`It was ${detail.life_habit}.`)

  // Environment
  const env = (detail.taxon_environment || '').toLowerCase()
  if (env.includes('marine')) parts.push('It inhabited the oceans — likely in warm, shallow seas that covered much of the ancient world.')
  else if (env.includes('freshwater')) parts.push('It lived in freshwater environments like rivers, lakes, and swamps.')
  else if (env.includes('terrestrial')) parts.push('It roamed on land.')
  else if (env) parts.push(`Its environment: ${detail.taxon_environment}.`)

  // Movement
  const motility = (detail.motility || '').toLowerCase()
  if (motility.includes('actively mobile') || motility.includes('fast')) parts.push('It was an active, mobile animal that moved around freely.')
  else if (motility.includes('facultat')) parts.push('It could move when needed, but often stayed anchored in one spot.')
  else if (motility.includes('stationary') || motility.includes('attached')) parts.push('It spent its life fixed in one place, attached to rocks or the sea floor.')
  else if (motility.includes('slow')) parts.push('It moved slowly across the sea floor.')

  return parts.length > 0 ? parts.join(' ') : null
}

function AboutSection({ genus, text }) {
  const [expanded, setExpanded] = useState(false)

  // Split into sentences, show first 3 by default
  const sentences = useMemo(() => {
    return text.match(/[^.!?]+[.!?]+/g) || [text]
  }, [text])

  const preview = sentences.slice(0, 3).join(' ').trim()
  const hasMore = sentences.length > 3
  const displayText = expanded ? text : preview

  return (
    <div className="species-page-description">
      <div className="species-page-section-title">About {genus}</div>
      <p className="species-page-text">{displayText}</p>
      {hasMore && !expanded && (
        <button
          className="species-page-read-more"
          onClick={() => setExpanded(true)}
        >
          Read more
        </button>
      )}
    </div>
  )
}

function SpeciesPage({ fossil, creatureType, onClose, onBack }) {
  const [wiki, setWiki] = useState(null)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  const name = fossil.accepted_name || fossil.identified_name || 'Unknown'
  const genus = name.split(' ')[0]
  const friendlyGroup = getFriendlyGroup(fossil.phylum, fossil.class)
  const location = [fossil.state, fossil.cc].filter(Boolean).join(', ')

  useEffect(() => {
    setLoading(true)
    setWiki(null)
    setDetail(null)

    Promise.all([
      fetchWikipediaSummary(name),
      fetchTaxonDetail(name),
    ]).then(([wikiData, taxonData]) => {
      setWiki(wikiData)
      setDetail(taxonData)
      setLoading(false)
    })
  }, [name])

  const lifestyleText = buildLifestyleText(detail)

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
            <div className="species-page-hero-caption">
              {wiki.imageIsPhoto
                ? `Image may show a living relative of ${genus}`
                : `Image: ${genus}`}
            </div>
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
            <div className="species-page-fact">
              <span className="species-page-fact-label">Type</span>
              <span className="species-page-fact-value">{friendlyGroup}</span>
            </div>
            {fossil.early_interval && (
              <div className="species-page-fact">
                <span className="species-page-fact-label">Time period</span>
                <span className="species-page-fact-value">{fossil.early_interval}</span>
              </div>
            )}
            {fossil.max_ma != null && fossil.min_ma != null && fossil.max_ma > 0 && (
              <div className="species-page-fact">
                <span className="species-page-fact-label">Lived</span>
                <span className="species-page-fact-value">
                  {fossil.max_ma}–{fossil.min_ma} million years ago
                </span>
              </div>
            )}
            {location && (
              <div className="species-page-fact">
                <span className="species-page-fact-label">Found in</span>
                <span className="species-page-fact-value">{location}</span>
              </div>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="species-page-loading">
              <div className="species-page-loading-dot" />
              Loading information...
            </div>
          )}

          {/* About — Wikipedia description */}
          {!loading && wiki?.extract && (
            <AboutSection genus={genus} text={wiki.extract} />
          )}

          {/* Lifestyle — from PBDB ecology data */}
          {!loading && lifestyleText && (
            <div className="species-page-description">
              <div className="species-page-section-title">Lifestyle &amp; habitat</div>
              <p className="species-page-text">{lifestyleText}</p>
            </div>
          )}

          {/* Discovery info */}
          {(fossil.collection_name || fossil.formation) && (
            <div className="species-page-description">
              <div className="species-page-section-title">This fossil</div>
              <p className="species-page-text">
                This specimen was found
                {fossil.collection_name ? ` at ${fossil.collection_name}` : ''}
                {location ? ` in ${location}` : ''}
                {fossil.formation ? `, in the ${fossil.formation} formation` : ''}
                . The coordinates of the discovery site are {fossil.lat.toFixed(2)}°N, {fossil.lng.toFixed(2)}°W.
              </p>
            </div>
          )}

          {/* No Wikipedia data */}
          {!loading && !wiki && (
            <div className="species-page-no-data">
              No Wikipedia article found for this species. Try searching for "{genus}" online for more information.
            </div>
          )}

          {/* Links */}
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
