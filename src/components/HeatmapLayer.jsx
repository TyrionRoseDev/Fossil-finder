import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'

function HeatmapLayer({ points }) {
  const map = useMap()
  const layerRef = useRef(null)

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current)
    }

    if (!points || points.length === 0) return

    layerRef.current = L.heatLayer(points, {
      radius: 12,
      blur: 16,
      max: 5,
      maxZoom: 10,
      minOpacity: 0.05,
      gradient: {
        0.2: 'transparent',
        0.4: 'rgba(212, 169, 89, 0.15)',
        0.6: 'rgba(212, 169, 89, 0.3)',
        0.8: 'rgba(240, 200, 100, 0.45)',
        1.0: 'rgba(255, 230, 160, 0.6)',
      },
    })

    layerRef.current.addTo(map)

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current)
      }
    }
  }, [points, map])

  return null
}

export default HeatmapLayer
