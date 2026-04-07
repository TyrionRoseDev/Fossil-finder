import { useMapEvents } from 'react-leaflet'

function MapEventHandler({ onViewChange }) {
  const map = useMapEvents({
    moveend() {
      const bounds = map.getBounds()
      const zoom = map.getZoom()
      onViewChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
        zoom,
      })
    },
  })
  return null
}

export default MapEventHandler
