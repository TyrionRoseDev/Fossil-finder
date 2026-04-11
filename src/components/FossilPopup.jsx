import { memo } from 'react'
import './FossilPopup.css'

function getCreatureLabel(phylum, className) {
  const p = (phylum || '').toLowerCase()
  const c = (className || '').toLowerCase()
  if (p === 'chordata') {
    if (c === 'mammalia') return 'Mammal'
    if (c === 'saurischia' || c === 'ornithischia' || c === 'dinosauria') return 'Dinosaur'
    if (c === 'reptilia') return 'Reptile'
    if (c === 'aves') return 'Bird'
    if (c === 'amphibia') return 'Amphibian'
    if (c === 'actinopterygii' || c === 'osteichthyes') return 'Fish'
    if (c === 'chondrichthyes') return 'Shark / ray'
    return 'Vertebrate'
  }
  if (p === 'mollusca') return 'Mollusk'
  if (p === 'arthropoda') {
    if (c === 'trilobita') return 'Trilobite'
    return 'Arthropod'
  }
  if (p === 'brachiopoda') return 'Brachiopod'
  if (p === 'echinodermata') return 'Echinoderm'
  if (p === 'cnidaria') return 'Coral / jellyfish'
  if (p === 'porifera') return 'Sponge'
  if (p === 'tracheophyta' || p === 'plantae') return 'Plant'
  return null
}

const FossilPopup = memo(function FossilPopup({ fossil, onExplore }) {
  const location = [fossil.state, fossil.cc].filter(Boolean).join(', ')
  const label = getCreatureLabel(fossil.phylum, fossil.class)

  return (
    <div className="fossil-popup">
      <div className="fossil-popup-era">
        {fossil.early_interval || 'Unknown Period'}
      </div>
      <div className="fossil-popup-name">
        {fossil.accepted_name || fossil.identified_name || 'Unknown'}
      </div>
      {label && (
        <div className="fossil-popup-creature">{label}</div>
      )}
      {location && (
        <div className="fossil-popup-location">{location}</div>
      )}
      <div className="fossil-popup-age">
        {fossil.max_ma != null && fossil.min_ma != null && fossil.max_ma > 0
          ? `${fossil.max_ma} – ${fossil.min_ma} Ma`
          : ''}
      </div>
      <div className="fossil-popup-divider" />
      <div className="fossil-popup-actions">
        <button
          className="fossil-popup-explore"
          onClick={() => onExplore(fossil)}
        >
          View details →
        </button>
      </div>
    </div>
  )
})

export default FossilPopup
