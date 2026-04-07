import { Marker } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import './FossilMarkers.css'

function createFossilIcon() {
  return L.divIcon({
    className: 'fossil-marker',
    html: '<div class="fossil-marker-dot"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

function createClusterIcon(cluster) {
  const count = cluster.getChildCount()
  const size = count > 100 ? 'large' : count > 10 ? 'medium' : 'small'
  return L.divIcon({
    className: `fossil-cluster fossil-cluster-${size}`,
    html: `<div class="fossil-cluster-inner">${count}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
}

function createGeoClusterIcon(nOccs) {
  const size = nOccs > 1000 ? 50 : nOccs > 100 ? 40 : 30
  return L.divIcon({
    className: 'fossil-cluster',
    html: `<div class="fossil-cluster-inner">${nOccs > 999 ? Math.round(nOccs / 1000) + 'k' : nOccs}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function FossilMarkers({ fossils, zoom, onExplore }) {
  const isClustered = zoom <= 5

  if (isClustered) {
    return fossils.map((cluster) => (
      <Marker
        key={cluster.bin_id || `${cluster.lat}-${cluster.lng}`}
        position={[cluster.lat, cluster.lng]}
        icon={createGeoClusterIcon(cluster.n_occs)}
      />
    ))
  }

  return (
    <MarkerClusterGroup
      chunkedLoading
      iconCreateFunction={createClusterIcon}
      maxClusterRadius={50}
      spiderfyOnMaxZoom
      showCoverageOnHover={false}
    >
      {fossils.map((fossil) => (
        <Marker
          key={fossil.occurrence_no}
          position={[fossil.lat, fossil.lng]}
          icon={createFossilIcon()}
        >
        </Marker>
      ))}
    </MarkerClusterGroup>
  )
}

export default FossilMarkers
