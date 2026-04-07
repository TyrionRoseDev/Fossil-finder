import './FossilPopup.css'

function FossilPopup({ fossil, onExplore }) {
  const location = [fossil.state, fossil.cc].filter(Boolean).join(', ')

  return (
    <div className="fossil-popup">
      <div className="fossil-popup-accent" />
      <div className="fossil-popup-era label">
        {fossil.early_interval || 'Unknown Period'}
      </div>
      <div className="fossil-popup-name">
        {fossil.accepted_name || fossil.identified_name || 'Unknown'}
      </div>
      {location && (
        <div className="fossil-popup-location">{location}</div>
      )}
      <div className="fossil-popup-age">
        {fossil.max_ma && fossil.min_ma
          ? `${fossil.max_ma} – ${fossil.min_ma} Ma`
          : 'Age unknown'}
      </div>
      <div className="fossil-popup-divider" />
      <div className="fossil-popup-actions">
        <button
          className="fossil-popup-explore"
          onClick={() => onExplore(fossil)}
        >
          EXPLORE &rarr;
        </button>
      </div>
    </div>
  )
}

export default FossilPopup
