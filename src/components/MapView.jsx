import { useState, useRef, useCallback, memo, useEffect } from 'react'
import Map from 'react-map-gl/mapbox'
// Imported here (not in main.jsx) so the Mapbox styles ship with the lazy map chunk
// instead of render-blocking the initial page.
import 'mapbox-gl/dist/mapbox-gl.css'
import FossilMarkers from './FossilMarkers'
import './MapView.css'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

const INITIAL_VIEW = {
  longitude: 0,
  latitude: 20,
  zoom: 1.8,
}

function MapView({ onViewChange, fossils, onExplore, fitTarget }) {
  const mapRef = useRef(null)
  const [viewState, setViewState] = useState(INITIAL_VIEW)

  const handleMove = useCallback((evt) => {
    setViewState(evt.viewState)
  }, [])

  const emitView = useCallback(() => {
    const map = mapRef.current?.getMap()
    if (!map) return
    const bounds = map.getBounds()
    onViewChange({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
      zoom: map.getZoom(),
    })
  }, [onViewChange])

  const handleLoad = useCallback(() => {
    const map = mapRef.current?.getMap()
    if (!map) return

    // Set atmosphere for space background
    map.setFog({
      color: 'rgb(186, 210, 235)',
      'high-color': 'rgb(36, 92, 223)',
      'horizon-blend': 0.02,
      'space-color': 'rgb(11, 11, 25)',
      'star-intensity': 0.6,
    })

    emitView()
  }, [emitView])

  // Fit bounds when fitTarget changes
  useEffect(() => {
    if (!fitTarget || fitTarget.length === 0) return
    const map = mapRef.current?.getMap()
    if (!map) return

    const lngs = fitTarget.map((f) => f.lng)
    const lats = fitTarget.map((f) => f.lat)
    const sw = [Math.min(...lngs), Math.min(...lats)]
    const ne = [Math.max(...lngs), Math.max(...lats)]

    map.fitBounds([sw, ne], { padding: 60, maxZoom: 10 })
  }, [fitTarget])

  // Interactive layer IDs for cursor changes (heatmap layer is not interactive)
  const interactiveLayerIds = viewState.zoom <= 5
    ? []
    : ['clusters', 'unclustered-point']

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={handleMove}
      onMoveEnd={emitView}
      onLoad={handleLoad}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
      projection="globe"
      style={{ width: '100%', height: '100%' }}
      minZoom={1.5}
      maxZoom={18}
      attributionControl={false}
      interactiveLayerIds={interactiveLayerIds}
      cursor="auto"
    >
      <FossilMarkers
        fossils={fossils}
        zoom={viewState.zoom}
        onExplore={onExplore}
        mapRef={mapRef}
      />
    </Map>
  )
}

export default memo(MapView)
