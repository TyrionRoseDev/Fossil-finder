import { useState, useEffect } from 'react'
import './TimelineSlider.css'

const MAX_AGE = 541
const MIN_AGE = 0

const ERAS = [
  { name: 'Paleozoic', start: 541, end: 252, color: '#7fa67f' },
  { name: 'Mesozoic', start: 252, end: 66, color: '#c8a040' },
  { name: 'Cenozoic', start: 66, end: 0, color: '#d4a070' },
]

function TimelineSlider({ filters, onFilterChange }) {
  const [ageMax, setAgeMax] = useState(MAX_AGE)
  const [ageMin, setAgeMin] = useState(MIN_AGE)

  useEffect(() => {
    if (filters.ageMax) setAgeMax(Number(filters.ageMax))
    if (filters.ageMin) setAgeMin(Number(filters.ageMin))
  }, [filters.ageMax, filters.ageMin])

  function toPercent(age) {
    return ((MAX_AGE - age) / (MAX_AGE - MIN_AGE)) * 100
  }

  function handleMaxChange(e) {
    const val = Math.max(Number(e.target.value), ageMin + 1)
    setAgeMax(val)
  }

  function handleMinChange(e) {
    const val = Math.min(Number(e.target.value), ageMax - 1)
    setAgeMin(val)
  }

  function handleCommit() {
    onFilterChange({
      ...filters,
      ageMax: ageMax === MAX_AGE && ageMin === MIN_AGE ? '' : String(ageMax),
      ageMin: ageMax === MAX_AGE && ageMin === MIN_AGE ? '' : String(ageMin),
    })
  }

  const leftPercent = toPercent(ageMax)
  const rightPercent = 100 - toPercent(ageMin)

  return (
    <div className="timeline-slider">
      <div className="timeline-title">Filter by time period</div>
      {/* Era labels */}
      <div className="timeline-eras">
        {ERAS.map((era) => (
          <div
            key={era.name}
            className="timeline-era-label"
            style={{
              left: `${toPercent(era.start)}%`,
              width: `${toPercent(era.end) - toPercent(era.start)}%`,
            }}
          >
            {era.name}
          </div>
        ))}
      </div>

      {/* Colored bar */}
      <div className="timeline-bar">
        <div className="timeline-bar-bg">
          {ERAS.map((era) => (
            <div
              key={era.name}
              className="timeline-bar-era"
              style={{
                left: `${toPercent(era.start)}%`,
                width: `${toPercent(era.end) - toPercent(era.start)}%`,
                background: era.color,
              }}
            />
          ))}
        </div>
        {/* Selection highlight */}
        <div
          className="timeline-bar-selection"
          style={{
            left: `${leftPercent}%`,
            right: `${rightPercent}%`,
          }}
        />
      </div>

      {/* Dual range inputs */}
      <div className="timeline-inputs">
        <input
          type="range"
          className="timeline-range"
          min={MIN_AGE}
          max={MAX_AGE}
          value={ageMax}
          onChange={handleMaxChange}
          onMouseUp={handleCommit}
          onTouchEnd={handleCommit}
        />
        <input
          type="range"
          className="timeline-range"
          min={MIN_AGE}
          max={MAX_AGE}
          value={ageMin}
          onChange={handleMinChange}
          onMouseUp={handleCommit}
          onTouchEnd={handleCommit}
        />
      </div>

      {/* Age labels */}
      <div className="timeline-labels">
        <span>{MAX_AGE} Ma</span>
        <span>{MIN_AGE} Ma</span>
      </div>
    </div>
  )
}

export default TimelineSlider
