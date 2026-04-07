import { MapContainer, TileLayer } from 'react-leaflet'
import './MapView.css'

const INITIAL_CENTER = [20, 0]
const INITIAL_ZOOM = 3
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'

function MapView() {
  return (
    <MapContainer
      center={INITIAL_CENTER}
      zoom={INITIAL_ZOOM}
      className="map-container"
      zoomControl={false}
      minZoom={2}
      maxZoom={18}
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
    </MapContainer>
  )
}

export default MapView
