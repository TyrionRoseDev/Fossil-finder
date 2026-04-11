import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

function FitBounds({ fossils }) {
  const map = useMap()

  useEffect(() => {
    if (!fossils || fossils.length === 0) return

    const bounds = L.latLngBounds(fossils.map((f) => [f.lat, f.lng]))
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 10 })
    }
  }, [fossils, map])

  return null
}

export default FitBounds
