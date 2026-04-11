import { useState, useEffect, useCallback } from 'react'
import MapView from './components/MapView'
import SearchBar from './components/SearchBar'
import DetailPanel from './components/DetailPanel'
import FilterChips from './components/FilterChips'
import FilterPanel from './components/FilterPanel'
import TimelineSlider from './components/TimelineSlider'
import FavoritesMenu from './components/FavoritesMenu'
import ResultsPanel from './components/ResultsPanel'
import SpeciesPage from './components/SpeciesPage'
import { fetchClusters, fetchOccurrences, fetchFilteredOccurrences } from './api/pbdb'
import { useDebounce } from './hooks/useDebounce'
import { useFavorites } from './hooks/useFavorites'

function App() {
  const [mapView, setMapView] = useState(null)
  const [fossils, setFossils] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [detailFossil, setDetailFossil] = useState(null)
  const [filters, setFilters] = useState({
    taxon: '',
    interval: '',
    ageMin: '',
    ageMax: '',
  })
  const [fitTarget, setFitTarget] = useState(null)
  const [appReady, setAppReady] = useState(false)
  const [lastFitFilter, setLastFitFilter] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [speciesInfo, setSpeciesInfo] = useState(null) // { fossil, creatureType }

  // Mark app as ready once first data loads
  useEffect(() => {
    if (!appReady && fossils.length > 0) {
      setTimeout(() => setAppReady(true), 300)
    }
  }, [fossils, appReady])

  const debouncedMapView = useDebounce(mapView, 600)

  const handleViewChange = useCallback((view) => {
    setMapView(view)
  }, [])

  const handleExplore = useCallback((fossil) => {
    setDetailFossil(fossil)
  }, [])

  const handleSearch = useCallback((taxonName) => {
    setFilters((prev) => ({ ...prev, taxon: taxonName }))
  }, [])

  const [filterPanelOpen, setFilterPanelOpen] = useState(false)

  const { favorites, toggleFavorite, isFavorite } = useFavorites()

  const handleRemoveFilter = useCallback((key) => {
    setFilters((prev) => {
      const next = { ...prev }
      if (key === 'age') {
        next.ageMin = ''
        next.ageMax = ''
      } else {
        next[key] = ''
      }
      return next
    })
  }, [])

  const handleApplyFilters = useCallback((newFilters) => {
    setFilters(newFilters)
  }, [])

  // Fetch individual occurrences for the results list when filters are active
  useEffect(() => {
    const hasFilter = filters.taxon || filters.interval || filters.ageMin || filters.ageMax
    if (!hasFilter) {
      setSearchResults([])
      return
    }

    const controller = new AbortController()
    const filterKey = `${filters.taxon}|${filters.interval}|${filters.ageMin}|${filters.ageMax}`
    fetchFilteredOccurrences(filters)
      .then((data) => {
        if (!controller.signal.aborted) {
          setSearchResults(data)
          if (data.length > 0 && filterKey !== lastFitFilter) {
            setFitTarget(data)
            setLastFitFilter(filterKey)
          }
        }
      })
      .catch(() => {})
    return () => controller.abort()
  }, [filters])

  useEffect(() => {
    if (!debouncedMapView) return

    const controller = new AbortController()

    async function loadFossils() {
      setLoading(true)
      setError(null)
      try {
        let data
        if (debouncedMapView.zoom <= 5) {
          data = await fetchClusters(debouncedMapView, filters, debouncedMapView.zoom)
        } else {
          data = await fetchOccurrences(debouncedMapView, filters)
        }
        if (!controller.signal.aborted) {
          setFossils(data)
          const hasFilter = filters.taxon || filters.interval || filters.ageMin || filters.ageMax
          if (!hasFilter) {
            setFitTarget(null)
            setLastFitFilter('')
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadFossils()
    return () => controller.abort()
  }, [debouncedMapView, filters])

  return (
    <div className="app">
      {!appReady && (
        <div className={`app-loading ${fossils.length > 0 ? 'fade-out' : ''}`}>
          <div className="app-loading-spinner" />
          <div className="app-loading-text">Loading the globe...</div>
        </div>
      )}
      <header className="app-header">
        <div className="app-logo">
          <svg className="app-logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="11" fill="#4285f4" />
            <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 2c1.5 0 2.8.5 3.9 1.3L14.5 8H12l-2 3h3l-1 3-3.5 5.5C6.3 18.2 5 15.8 5 13c0-3.9 3.1-7 7-7v2z" fill="rgba(255,255,255,0.9)" />
          </svg>
          <span className="app-logo-title">Fossil Tracker</span>
        </div>
      </header>
      <MapView
        onViewChange={handleViewChange}
        fossils={fossils}
        onExplore={handleExplore}
        fitTarget={fitTarget}
      />
      <SearchBar onSelect={handleSearch} />
      <FavoritesMenu
        favorites={favorites}
        onSelect={handleExplore}
        onRemove={toggleFavorite}
      />
      <FilterChips
        filters={filters}
        onRemove={handleRemoveFilter}
        onOpenPanel={() => setFilterPanelOpen(true)}
        onQuickFilter={(taxon) => setFilters((prev) => ({ ...prev, taxon }))}
      />
      <ResultsPanel
        fossils={searchResults.length > 0 ? searchResults : fossils}
        isClustered={searchResults.length === 0 && debouncedMapView?.zoom <= 5}
        onSelect={handleExplore}
        searchTaxon={filters.taxon || null}
      />
      <TimelineSlider filters={filters} onFilterChange={setFilters} />
      {filterPanelOpen && (
        <FilterPanel
          filters={filters}
          onApply={handleApplyFilters}
          onClose={() => setFilterPanelOpen(false)}
        />
      )}
      {loading && (
        <div className="loading-indicator">
          <span className="loading-dot" />
          Loading fossils...
        </div>
      )}
      {error && (
        <div className="error-indicator">{error}</div>
      )}
      {!detailFossil && !filters.taxon && !filters.interval && !loading && fossils.length === 0 && (
        <div className="welcome-message">
          <div className="welcome-title">Explore ancient life on Earth</div>
          <div className="welcome-subtitle">
            Search for a species, tap a filter, or zoom into the globe to discover fossils from millions of years ago.
          </div>
        </div>
      )}
      <DetailPanel
        fossil={detailFossil}
        onClose={() => setDetailFossil(null)}
        isFavorite={detailFossil ? isFavorite(detailFossil.occurrence_no) : false}
        onToggleFavorite={toggleFavorite}
        onShowSpecies={(fossil, creatureType) => setSpeciesInfo({ fossil, creatureType })}
      />
      {speciesInfo && (
        <SpeciesPage
          fossil={speciesInfo.fossil}
          creatureType={speciesInfo.creatureType}
          onClose={() => {
            setSpeciesInfo(null)
            setDetailFossil(null)
          }}
          onBack={() => setSpeciesInfo(null)}
        />
      )}
    </div>
  )
}

export default App
