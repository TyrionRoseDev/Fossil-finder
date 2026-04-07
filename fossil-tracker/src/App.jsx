import { useState, useEffect, useCallback } from 'react'
import MapView from './components/MapView'
import SearchBar from './components/SearchBar'
import DetailPanel from './components/DetailPanel'
import FilterChips from './components/FilterChips'
import FilterPanel from './components/FilterPanel'
import TimelineSlider from './components/TimelineSlider'
import FavoritesMenu from './components/FavoritesMenu'
import { fetchClusters, fetchOccurrences } from './api/pbdb'
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

  const debouncedMapView = useDebounce(mapView, 300)

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

  useEffect(() => {
    if (!debouncedMapView) return

    const controller = new AbortController()

    async function loadFossils() {
      setLoading(true)
      setError(null)
      try {
        let data
        if (debouncedMapView.zoom <= 5) {
          data = await fetchClusters(filters)
        } else {
          data = await fetchOccurrences(debouncedMapView, filters)
        }
        if (!controller.signal.aborted) {
          setFossils(data)
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
      <header className="app-header glass">
        <div className="app-logo">
          <div className="app-logo-icon">&#129430;</div>
          <div className="app-logo-text">
            <span className="app-logo-title">FOSSIL TRACKER</span>
            <span className="app-logo-subtitle">Explore Deep Time</span>
          </div>
        </div>
      </header>
      <MapView
        onViewChange={handleViewChange}
        fossils={fossils}
        onExplore={handleExplore}
      />
      <SearchBar onSelect={handleSearch} />
      <FavoritesMenu count={favorites.length} />
      <FilterChips
        filters={filters}
        onRemove={handleRemoveFilter}
        onOpenPanel={() => setFilterPanelOpen(true)}
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
        <div className="loading-indicator">Loading fossils...</div>
      )}
      {error && (
        <div className="error-indicator">{error}</div>
      )}
      <DetailPanel
        fossil={detailFossil}
        onClose={() => setDetailFossil(null)}
        isFavorite={detailFossil ? isFavorite(detailFossil.occurrence_no) : false}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  )
}

export default App
