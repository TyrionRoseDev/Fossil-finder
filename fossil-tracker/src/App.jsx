import { useState, useEffect, useCallback } from 'react'
import MapView from './components/MapView'
import { fetchClusters, fetchOccurrences } from './api/pbdb'
import { useDebounce } from './hooks/useDebounce'

function App() {
  const [mapView, setMapView] = useState(null)
  const [fossils, setFossils] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
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
      <MapView onViewChange={handleViewChange} fossils={fossils} />
      {loading && (
        <div className="loading-indicator">Loading fossils...</div>
      )}
      {error && (
        <div className="error-indicator">{error}</div>
      )}
    </div>
  )
}

export default App
