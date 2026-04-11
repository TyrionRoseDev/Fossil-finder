import { useState, useEffect } from 'react'
import { fetchTaxonDetail } from '../api/pbdb'
import './DetailPanel.css'

// Friendly descriptions for taxonomy ranks
const RANK_LABELS = {
  Phylum: 'Major group',
  Class: 'Class',
  Order: 'Order',
  Family: 'Family',
  Genus: 'Genus',
}

// Friendly descriptions for ecology tags
const ECOLOGY_DESCRIPTIONS = {
  chemosymbiotic: 'Lives with chemical-feeding bacteria',
  photosymbiotic: 'Lives with photosynthetic organisms',
  'deep infaunal': 'Lived buried deep in sediment',
  'shallow infaunal': 'Lived buried in shallow sediment',
  'semi-infaunal': 'Lived partially buried',
  epifaunal: 'Lived on the surface of the seafloor',
  pelagic: 'Lived in open water',
  nektonic: 'Actively swam through water',
  planktonic: 'Drifted with ocean currents',
  'facultatively mobile': 'Could move but often stayed put',
  'fast-moving': 'Moved quickly',
  stationary: 'Stayed in one place',
  attached: 'Attached to a surface',
  herbivore: 'Ate plants',
  carnivore: 'Ate other animals',
  omnivore: 'Ate plants and animals',
  'suspension feeder': 'Filtered food from water',
  'deposit feeder': 'Ate particles from sediment',
  grazer: 'Grazed on surfaces',
  marine: 'Lived in the ocean',
  freshwater: 'Lived in fresh water',
  terrestrial: 'Lived on land',
  'ground dwelling': 'Lived on the ground',
  arboreal: 'Lived in trees',
  fossorial: 'Lived underground (burrowing)',
  aquatic: 'Lived in water',
  volant: 'Could fly',
  cursorial: 'Built for running',
  saltatorial: 'Built for jumping',
  scansorial: 'Built for climbing',
  solitary: 'Lived alone',
  gregarious: 'Lived in groups',
  colonial: 'Lived in colonies',
  'actively mobile': 'Moved around actively',
  'slow-moving': 'Moved slowly',
  semifossorial: 'Partially burrowing',
}

function friendlyEcology(tag) {
  const lower = tag.toLowerCase().trim()
  // Check exact match first
  if (ECOLOGY_DESCRIPTIONS[lower]) return ECOLOGY_DESCRIPTIONS[lower]
  // Check partial matches
  for (const [key, desc] of Object.entries(ECOLOGY_DESCRIPTIONS)) {
    if (lower.includes(key) || key.includes(lower)) return desc
  }
  // Capitalize and return as-is for unrecognized tags
  return tag.charAt(0).toUpperCase() + tag.slice(1)
}

// Map phylum+class to a simple, friendly group name
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
    if (c === 'malacostraca') return 'Crustacean'
    return 'Arthropod'
  }
  if (p === 'mollusca') {
    if (c === 'bivalvia') return 'Clam / mussel'
    if (c === 'gastropoda') return 'Snail'
    if (c === 'cephalopoda') return 'Squid / octopus relative'
    return 'Mollusk'
  }
  if (p === 'echinodermata') return 'Sea urchin / starfish relative'
  if (p === 'brachiopoda') return 'Brachiopod'
  if (p === 'cnidaria') return 'Coral / jellyfish'
  if (p === 'bryozoa') return 'Bryozoan'
  if (p === 'porifera') return 'Sponge'
  if (p === 'tracheophyta' || p === 'plantae') return 'Plant'
  return phylum || 'Unknown'
}

// Map phylum + class to a plain-English creature description
function getCreatureType(phylum, className) {
  const p = (phylum || '').toLowerCase()
  const c = (className || '').toLowerCase()

  // Arthropods
  if (p === 'arthropoda') {
    if (c === 'trilobita') return '🦀 An ancient trilobite — an extinct marine arthropod'
    if (c === 'insecta') return '🐛 An ancient insect'
    if (c === 'malacostraca') return '🦀 An ancient crustacean (related to crabs and shrimp)'
    if (c === 'arachnida') return '🕷️ An ancient arachnid (related to spiders)'
    if (c === 'ostracoda') return '🦐 A tiny shelled crustacean (seed shrimp)'
    return '🦀 An ancient arthropod (jointed-leg animal)'
  }

  // Mollusks
  if (p === 'mollusca') {
    if (c === 'bivalvia') return '🐚 An ancient bivalve (a type of clam or mussel)'
    if (c === 'gastropoda') return '🐌 An ancient gastropod (a type of snail)'
    if (c === 'cephalopoda') return '🦑 An ancient cephalopod (related to octopus and squid)'
    return '🐚 An ancient mollusk (shelled sea creature)'
  }

  // Chordates (vertebrates)
  if (p === 'chordata') {
    if (c === 'mammalia') return '🦣 An ancient mammal'
    if (c === 'reptilia') return '🦎 An ancient reptile'
    if (c === 'dinosauria' || c === 'saurischia' || c === 'ornithischia') return '🦕 A dinosaur!'
    if (c === 'aves') return '🐦 An ancient bird'
    if (c === 'amphibia') return '🐸 An ancient amphibian'
    if (c === 'actinopterygii' || c === 'osteichthyes') return '🐟 An ancient bony fish'
    if (c === 'chondrichthyes') return '🦈 An ancient shark or ray'
    if (c === 'placodermi') return '🐟 An ancient armored fish (placoderm)'
    return '🦴 An ancient vertebrate (animal with a backbone)'
  }

  // Echinoderms
  if (p === 'echinodermata') {
    if (c === 'crinoidea') return '🌊 An ancient sea lily (crinoid)'
    if (c === 'echinoidea') return '🌊 An ancient sea urchin'
    if (c === 'asteroidea') return '⭐ An ancient starfish'
    return '🌊 An ancient echinoderm (related to starfish and sea urchins)'
  }

  // Brachiopods
  if (p === 'brachiopoda') return '🐚 An ancient brachiopod (a shelled marine animal, not a clam!)'

  // Cnidarians
  if (p === 'cnidaria') return '🪸 An ancient coral or jellyfish relative'

  // Bryozoans
  if (p === 'bryozoa') return '🪸 An ancient bryozoan (tiny colonial marine animal)'

  // Porifera
  if (p === 'porifera') return '🧽 An ancient sponge'

  // Plants
  if (p === 'tracheophyta' || p === 'plantae') return '🌿 An ancient plant'

  // Foraminifera
  if (p === 'foraminifera') return '🔬 A foraminifera (microscopic shelled organism)'

  if (phylum) return `An ancient ${phylum} organism`
  return null
}

function buildEcologyDescription(genus, tags) {
  const lower = tags.map(t => t.toLowerCase().trim())
  const parts = []

  // Diet
  if (lower.some(t => t.includes('carniv') || t.includes('ate other'))) {
    parts.push(`${genus} was a predator that hunted and ate other animals.`)
  } else if (lower.some(t => t.includes('herbiv'))) {
    parts.push(`${genus} was a plant-eater.`)
  } else if (lower.some(t => t.includes('omniv'))) {
    parts.push(`${genus} ate both plants and animals.`)
  } else if (lower.some(t => t.includes('suspension') || t.includes('filter'))) {
    parts.push(`${genus} was a filter feeder, straining tiny food particles from the water.`)
  } else if (lower.some(t => t.includes('deposit'))) {
    parts.push(`${genus} fed by sifting through sediment on the seafloor.`)
  } else if (lower.some(t => t.includes('grazer'))) {
    parts.push(`${genus} grazed on algae and organic matter growing on surfaces.`)
  }

  // Habitat
  const habitat = []
  if (lower.some(t => t.includes('ground dwelling') || t.includes('ground-dwelling'))) {
    habitat.push('on the ground')
  }
  if (lower.some(t => t.includes('arboreal') || t.includes('tree'))) {
    habitat.push('in trees')
  }
  if (lower.some(t => t.includes('fossorial') || t.includes('burrowing'))) {
    habitat.push('in underground burrows')
  }
  if (lower.some(t => t.includes('aquatic'))) {
    habitat.push('in water')
  }
  if (habitat.length > 0) {
    parts.push(`It lived ${habitat.join(' and ')}.`)
  }

  // Environment
  if (lower.some(t => t.includes('marine') || t.includes('ocean'))) {
    parts.push('It inhabited the oceans.')
  } else if (lower.some(t => t.includes('freshwater'))) {
    parts.push('It lived in freshwater rivers and lakes.')
  } else if (lower.some(t => t.includes('terrestrial') || t.includes('land'))) {
    parts.push('It was a land-dwelling creature.')
  }

  // Social
  if (lower.some(t => t.includes('solitary'))) {
    parts.push('It was a solitary animal, typically living and hunting alone.')
  } else if (lower.some(t => t.includes('gregarious') || t.includes('group'))) {
    parts.push('It lived in groups or herds.')
  } else if (lower.some(t => t.includes('colonial'))) {
    parts.push('It lived in colonies with many others of its kind.')
  }

  // Movement
  if (lower.some(t => t.includes('actively mobile') || t.includes('active'))) {
    parts.push('It was an active, mobile animal.')
  } else if (lower.some(t => t.includes('stationary') || t.includes('attached'))) {
    parts.push('It stayed fixed in one place throughout its life.')
  } else if (lower.some(t => t.includes('facultat'))) {
    parts.push('It could move when needed but often stayed in one spot.')
  }

  if (parts.length === 0) {
    return tags.map(t => friendlyEcology(t)).join('. ') + '.'
  }

  return parts.join(' ')
}

function DetailPanel({ fossil, onClose, isFavorite, onToggleFavorite, onShowSpecies }) {
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

  const ecologyTags = detail
    ? [detail.diet, detail.life_habit, detail.motility, detail.taxon_environment]
        .filter(Boolean)
        .flatMap(tag => tag.split(', '))
    : []

  const ageText = fossil.max_ma != null && fossil.min_ma != null && fossil.max_ma > 0
    ? `${fossil.max_ma}–${fossil.min_ma} million years ago`
    : null

  const creatureType = getCreatureType(fossil.phylum, fossil.class)
  const friendlyGroup = getFriendlyGroup(fossil.phylum, fossil.class)

  return (
    <div className="detail-panel-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
        <div className="detail-panel-accent" />

        <button className="detail-panel-close" onClick={onClose}>&times;</button>

        {/* Header */}
        <div className="detail-panel-header">
          <div className="detail-panel-period">
            {fossil.early_interval || 'Unknown Period'}
          </div>
          <h2 className="detail-panel-name">{name}</h2>
          {fossil.identified_name && fossil.identified_name !== name && (
            <div className="detail-panel-alt-name">{fossil.identified_name}</div>
          )}
          {creatureType && (
            <div className="detail-panel-creature">{creatureType}</div>
          )}
        </div>

        {/* Quick facts as compact cards */}
        <div className="detail-panel-quick-facts">
          {friendlyGroup && (
            <div className="detail-panel-quick-fact">
              <span className="detail-panel-quick-label">Type</span>
              <span className="detail-panel-quick-value">{friendlyGroup}</span>
            </div>
          )}
          {fossil.early_interval && (
            <div className="detail-panel-quick-fact">
              <span className="detail-panel-quick-label">Period</span>
              <span className="detail-panel-quick-value">{fossil.early_interval}</span>
            </div>
          )}
          {ageText && (
            <div className="detail-panel-quick-fact">
              <span className="detail-panel-quick-label">Lived</span>
              <span className="detail-panel-quick-value">{ageText}</span>
            </div>
          )}
          {location && (
            <div className="detail-panel-quick-fact">
              <span className="detail-panel-quick-label">Found in</span>
              <span className="detail-panel-quick-value">{location}</span>
            </div>
          )}
        </div>

        {/* The fossil discovery */}
        {(fossil.collection_name || fossil.primary_reference) && (
          <div className="detail-panel-section">
            <div className="detail-panel-section-title">About this fossil</div>
            {fossil.collection_name && (
              <div className="detail-panel-fossil-detail">
                <span className="detail-panel-fossil-label">Found at</span>
                <span className="detail-panel-fossil-value">{fossil.collection_name}</span>
              </div>
            )}
            {fossil.primary_reference && (
              <div className="detail-panel-fossil-detail">
                <span className="detail-panel-fossil-label">Described by</span>
                <span className="detail-panel-fossil-value">{fossil.primary_reference}</span>
              </div>
            )}
          </div>
        )}

        {/* How did it live */}
        {ecologyTags.length > 0 && (
          <div className="detail-panel-section">
            <div className="detail-panel-section-title">How did it live?</div>
            <p className="detail-panel-ecology-text">
              {buildEcologyDescription(name.split(' ')[0], ecologyTags)}
            </p>
          </div>
        )}

        {loading && (
          <div className="detail-panel-loading">Loading details...</div>
        )}

        {/* Actions */}
        <div className="detail-panel-actions">
          <button
            className="detail-panel-action detail-panel-action-save"
            onClick={() => onToggleFavorite(fossil)}
          >
            {isFavorite ? '♥ Saved' : '♡ Save'}
          </button>
          <button
            className="detail-panel-action detail-panel-action-link"
            onClick={() => onShowSpecies(fossil, creatureType)}
          >
            Learn more →
          </button>
        </div>
      </div>
    </div>
  )
}

export default DetailPanel
