import { memo, useMemo, useState, useEffect } from 'react'
import { Source, Layer, Popup } from 'react-map-gl/mapbox'
import FossilPopup from './FossilPopup'

const EMPTY_GEOJSON = { type: 'FeatureCollection', features: [] }

function toGeoJSON(fossils) {
  return {
    type: 'FeatureCollection',
    features: fossils.map((f, i) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [f.lng, f.lat],
      },
      properties: { n_occs: f.n_occs || 1, idx: i },
    })),
  }
}

function hasLayer(map, id) {
  try { return !!map.getLayer(id) } catch { return false }
}

function FossilMarkers({ fossils, zoom, onExplore, mapRef }) {
  const [popupFossil, setPopupFossil] = useState(null)
  const isClustered = zoom <= 5

  const heatGeoJSON = useMemo(
    () => (isClustered ? toGeoJSON(fossils) : EMPTY_GEOJSON),
    [fossils, isClustered]
  )

  const pointGeoJSON = useMemo(
    () => (isClustered ? EMPTY_GEOJSON : toGeoJSON(fossils)),
    [fossils, isClustered]
  )

  useEffect(() => {
    const map = mapRef.current?.getMap()
    if (!map) return

    function handleClick(e) {
      if (hasLayer(map, 'clusters')) {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
        if (features.length > 0) {
          const feature = features[0]
          const clusterId = feature.properties.cluster_id
          const source = map.getSource('fossils-points')
          if (source && source.getClusterExpansionZoom) {
            source.getClusterExpansionZoom(clusterId, (err, z) => {
              if (err) return
              map.easeTo({ center: feature.geometry.coordinates, zoom: z })
            })
          }
          return
        }
      }

      if (hasLayer(map, 'unclustered-point')) {
        const features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] })
        if (features.length > 0) {
          const idx = features[0].properties.idx
          const fossil = fossils[idx]
          if (fossil) setPopupFossil(fossil)
          return
        }
      }
    }

    map.on('click', handleClick)
    return () => map.off('click', handleClick)
  }, [fossils, zoom, mapRef])

  useEffect(() => { setPopupFossil(null) }, [fossils])

  return (
    <>
      {/* Heatmap source — always mounted, fed data only when zoomed out */}
      <Source id="fossils-heat" type="geojson" data={heatGeoJSON}>
        <Layer
          id="geosums"
          type="heatmap"
          paint={{
            'heatmap-weight': [
              'interpolate', ['linear'], ['get', 'n_occs'],
              0, 0, 50, 0.2, 500, 0.5, 5000, 0.8, 50000, 1,
            ],
            'heatmap-intensity': [
              'interpolate', ['linear'], ['zoom'],
              1, 1.5, 3, 2, 5, 2.5,
            ],
            'heatmap-color': [
              'interpolate', ['linear'], ['heatmap-density'],
              0, 'rgba(0, 0, 0, 0)',
              0.1, 'rgba(30, 80, 200, 0.15)',
              0.25, 'rgba(50, 110, 240, 0.35)',
              0.45, 'rgba(66, 133, 244, 0.55)',
              0.65, 'rgba(100, 170, 255, 0.7)',
              0.8, 'rgba(150, 200, 255, 0.8)',
              1, 'rgba(220, 240, 255, 0.9)',
            ],
            'heatmap-radius': [
              'interpolate', ['linear'], ['zoom'],
              1, 20, 3, 25, 5, 35,
            ],
            'heatmap-opacity': [
              'interpolate', ['linear'], ['zoom'],
              1, 0.85, 5, 0.75,
            ],
          }}
        />
      </Source>

      {/* Clustered points source — always mounted, fed data only when zoomed in */}
      <Source
        id="fossils-points"
        type="geojson"
        data={pointGeoJSON}
        cluster={true}
        clusterMaxZoom={14}
        clusterRadius={50}
      >
        <Layer
          id="clusters"
          type="circle"
          filter={['has', 'point_count']}
          paint={{
            'circle-color': '#4285f4',
            'circle-opacity': 0.85,
            'circle-radius': ['step', ['get', 'point_count'], 16, 10, 22, 50, 30, 200, 38],
            'circle-stroke-width': 2,
            'circle-stroke-color': 'rgba(255, 255, 255, 0.3)',
          }}
        />
        <Layer
          id="cluster-count"
          type="symbol"
          filter={['has', 'point_count']}
          layout={{
            'text-field': '{point_count_abbreviated}',
            'text-size': 12,
            'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
          }}
          paint={{ 'text-color': '#ffffff' }}
        />
        <Layer
          id="unclustered-point"
          type="circle"
          filter={['!', ['has', 'point_count']]}
          paint={{
            'circle-color': '#4285f4',
            'circle-radius': 6,
            'circle-stroke-width': 2,
            'circle-stroke-color': 'rgba(255, 255, 255, 0.5)',
          }}
        />
      </Source>

      {popupFossil && (
        <Popup
          longitude={popupFossil.lng}
          latitude={popupFossil.lat}
          anchor="bottom"
          onClose={() => setPopupFossil(null)}
          closeOnClick={false}
        >
          <FossilPopup fossil={popupFossil} onExplore={onExplore} />
        </Popup>
      )}
    </>
  )
}

export default memo(FossilMarkers)
