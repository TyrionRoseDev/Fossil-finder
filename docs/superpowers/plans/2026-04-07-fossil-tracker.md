# Fossil Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an interactive fossil tracker web app with a cinematic museum theme — a full-screen map showing fossil discovery locations worldwide, with filtering, search, detail views, and favorites.

**Architecture:** React SPA with full-screen Leaflet map. PBDB API provides all fossil data (no backend needed). State lives in App component and flows down via props. Clustered markers at low zoom, individual markers at high zoom, with debounced API calls on map movement. localStorage for favorites persistence.

**Tech Stack:** React 19 (Vite), React Leaflet 5, react-leaflet-cluster, Leaflet with CartoDB Dark Matter tiles, PBDB REST API, CSS custom properties for theming.

**Spec:** `docs/superpowers/specs/2026-04-07-fossil-tracker-design.md`

---

## File Structure

```
fossil-tracker/
├── index.html
├── package.json
├── vite.config.js
├── public/
├── src/
│   ├── main.jsx                    # Entry point, renders App
│   ├── App.jsx                     # Root component, all shared state lives here
│   ├── App.css                     # Global theme (CSS custom properties, base styles)
│   ├── api/
│   │   └── pbdb.js                 # All PBDB API fetch functions
│   ├── hooks/
│   │   ├── useDebounce.js          # Debounce hook for map movement
│   │   └── useFavorites.js         # localStorage favorites hook
│   ├── components/
│   │   ├── MapView.jsx             # Full-screen Leaflet MapContainer
│   │   ├── MapView.css
│   │   ├── MapEventHandler.jsx     # Invisible component: listens to map events
│   │   ├── FossilMarkers.jsx       # Renders clustered or individual markers
│   │   ├── FossilMarkers.css       # Glowing marker styles
│   │   ├── FossilPopup.jsx         # Popup content when clicking a marker
│   │   ├── FossilPopup.css
│   │   ├── SearchBar.jsx           # Floating search with autocomplete
│   │   ├── SearchBar.css
│   │   ├── FilterChips.jsx         # Active filter tag pills
│   │   ├── FilterChips.css
│   │   ├── FilterPanel.jsx         # Expandable filter overlay
│   │   ├── FilterPanel.css
│   │   ├── TimelineSlider.jsx      # Geological time range slider
│   │   ├── TimelineSlider.css
│   │   ├── DetailPanel.jsx         # Slide-in fossil detail view
│   │   ├── DetailPanel.css
│   │   └── FavoritesMenu.jsx       # Favorites dropdown
│   │       FavoritesMenu.css
│   └── __tests__/
│       ├── pbdb.test.js            # API function tests
│       ├── useDebounce.test.js     # Debounce hook tests
│       └── useFavorites.test.js    # Favorites hook tests
```

---

### Task 1: Project Scaffold & Dependencies

**Files:**
- Create: `package.json` (via Vite scaffold)
- Modify: `src/main.jsx`, `src/App.jsx`, `src/App.css`, `index.html`

- [ ] **Step 1: Scaffold the Vite project**

```bash
cd /Users/tyrion/Dev/untitled2
npm create vite@latest fossil-tracker -- --template react
cd fossil-tracker
```

> **React concept — Project structure:** Vite creates a minimal React app for you. `src/main.jsx` is the entry point that mounts your React app into the DOM. `src/App.jsx` is your root component — think of it as the container for everything visible on screen.

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install react-leaflet leaflet react-leaflet-cluster
```

- [ ] **Step 3: Install dev dependencies for testing**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 4: Configure Vitest**

Add test config to `vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.js',
  },
})
```

Create `src/test-setup.js`:

```js
import '@testing-library/jest-dom'
```

Add to `package.json` scripts:

```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 5: Clean up scaffold files**

Remove default Vite boilerplate: delete `src/assets/`, clear contents of `src/App.css`, replace `src/App.jsx` with a minimal placeholder:

```jsx
function App() {
  return <div className="app">Fossil Tracker</div>
}

export default App
```

Add Leaflet CSS import to `src/main.jsx`:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import './App.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 6: Verify dev server runs**

```bash
npm run dev
```

Expected: Dev server starts, browser shows "Fossil Tracker" text.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "scaffold: Vite + React project with Leaflet and testing deps"
```

---

### Task 2: Cinematic Museum Theme

**Files:**
- Create: `src/App.css`

> **React concept — CSS Custom Properties:** We define our color palette as CSS variables (custom properties) on `:root`. This means every component can reference `var(--color-gold)` instead of hardcoding hex values. If you ever want to tweak the theme, you change one place.

- [ ] **Step 1: Write the global theme CSS**

Write `src/App.css`:

```css
:root {
  /* Color palette — Cinematic Museum */
  --color-base: #0d0b08;
  --color-surface: #1a160e;
  --color-gold: #d4a959;
  --color-gold-muted: rgba(212, 169, 89, 0.4);
  --color-gold-subtle: rgba(212, 169, 89, 0.15);
  --color-gold-border: rgba(212, 169, 89, 0.2);
  --color-text: #f0e6d0;
  --color-text-secondary: rgba(212, 169, 89, 0.5);

  /* Typography */
  --font-display: Georgia, 'Times New Roman', serif;
  --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  /* Effects */
  --glass-bg: rgba(13, 11, 8, 0.95);
  --glass-blur: blur(12px);
  --glow-gold: 0 0 20px rgba(212, 169, 89, 0.5), 0 0 40px rgba(212, 169, 89, 0.2);
  --transition-smooth: 0.3s ease;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-body);
  background: var(--color-base);
  color: var(--color-text);
  overflow: hidden;
}

.app {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

/* Utility: uppercase exhibit-style labels */
.label {
  font-family: var(--font-body);
  font-size: 0.65rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

/* Utility: gold accent line */
.accent-line {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212, 169, 89, 0.5), transparent);
}

/* Utility: glass panel */
.glass {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--color-gold-border);
}
```

- [ ] **Step 2: Update index.html title**

In `index.html`, change the `<title>` to `Fossil Tracker`.

- [ ] **Step 3: Verify theme loads**

```bash
npm run dev
```

Expected: Page background is near-black (`#0d0b08`), text is warm white.

- [ ] **Step 4: Commit**

```bash
git add src/App.css index.html
git commit -m "style: add cinematic museum theme with CSS custom properties"
```

---

### Task 3: Full-Screen Map

**Files:**
- Create: `src/components/MapView.jsx`, `src/components/MapView.css`
- Modify: `src/App.jsx`

> **React concept — Components:** A component is a reusable piece of UI. `MapView` wraps the Leaflet map in its own component so `App` stays clean. Components are just functions that return JSX (HTML-like syntax). We import and use them like custom HTML tags: `<MapView />`.

- [ ] **Step 1: Create MapView component**

Create `src/components/MapView.jsx`:

```jsx
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
```

- [ ] **Step 2: Create MapView CSS**

Create `src/components/MapView.css`:

```css
.map-container {
  width: 100%;
  height: 100%;
  background: var(--color-base);
}

/* Vignette overlay on map edges */
.map-container::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 400;
  background: radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, 0.4) 100%);
}
```

- [ ] **Step 3: Mount MapView in App**

Update `src/App.jsx`:

```jsx
import MapView from './components/MapView'

function App() {
  return (
    <div className="app">
      <MapView />
    </div>
  )
}

export default App
```

- [ ] **Step 4: Verify map renders**

```bash
npm run dev
```

Expected: Full-screen dark map with CartoDB Dark Matter tiles. Vignette darkens the edges. You can pan and zoom.

- [ ] **Step 5: Commit**

```bash
git add src/components/MapView.jsx src/components/MapView.css src/App.jsx
git commit -m "feat: add full-screen dark map with vignette overlay"
```

---

### Task 4: PBDB API Service

**Files:**
- Create: `src/api/pbdb.js`, `src/__tests__/pbdb.test.js`

> **React concept — Separation of concerns:** We keep API logic in its own file, separate from components. Components handle what the user sees; the API module handles how we talk to the server. This makes both easier to understand and test.

- [ ] **Step 1: Write tests for the API URL builder and response parser**

Create `src/__tests__/pbdb.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildUrl, parseOccurrences, parseClusters, fetchClusters, fetchOccurrences, fetchTaxonAutocomplete, fetchTaxonDetail, fetchIntervals } from '../api/pbdb'

describe('buildUrl', () => {
  it('builds a URL with base path and params', () => {
    const url = buildUrl('/occs/list.json', { base_name: 'Dinosauria', limit: 10 })
    expect(url).toBe('https://paleobiodb.org/data1.2/occs/list.json?base_name=Dinosauria&limit=10&vocab=pbdb')
  })

  it('omits undefined and empty string params', () => {
    const url = buildUrl('/occs/list.json', { base_name: 'Dinosauria', interval: '', other: undefined })
    expect(url).toBe('https://paleobiodb.org/data1.2/occs/list.json?base_name=Dinosauria&vocab=pbdb')
  })
})

describe('parseOccurrences', () => {
  it('parses lat/lng strings to numbers', () => {
    const raw = [
      { occurrence_no: '1', accepted_name: 'T. rex', lat: '47.6', lng: '-106.5', max_ma: 72.2, min_ma: 66 }
    ]
    const result = parseOccurrences(raw)
    expect(result[0].lat).toBe(47.6)
    expect(result[0].lng).toBe(-106.5)
    expect(typeof result[0].lat).toBe('number')
  })

  it('filters out records with invalid coordinates', () => {
    const raw = [
      { occurrence_no: '1', accepted_name: 'T. rex', lat: '47.6', lng: '-106.5', max_ma: 72, min_ma: 66 },
      { occurrence_no: '2', accepted_name: 'Bad', lat: '', lng: '', max_ma: 72, min_ma: 66 },
    ]
    const result = parseOccurrences(raw)
    expect(result).toHaveLength(1)
  })
})

describe('parseClusters', () => {
  it('passes through numeric lat/lng as-is', () => {
    const raw = [{ bin_id: '1', n_occs: 42, lat: -18.3, lng: 178.7 }]
    const result = parseClusters(raw)
    expect(result[0].lat).toBe(-18.3)
    expect(result[0].n_occs).toBe(42)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/tyrion/Dev/untitled2/fossil-tracker
npx vitest run src/__tests__/pbdb.test.js
```

Expected: FAIL — module `../api/pbdb` does not exist.

- [ ] **Step 3: Implement the API service**

Create `src/api/pbdb.js`:

```js
const BASE_URL = 'https://paleobiodb.org/data1.2'

export function buildUrl(path, params = {}) {
  const filtered = Object.entries({ ...params, vocab: 'pbdb' })
    .filter(([, v]) => v !== undefined && v !== '')
  const query = new URLSearchParams(filtered).toString()
  return `${BASE_URL}${path}?${query}`
}

export function parseOccurrences(records) {
  return records
    .map(r => ({
      ...r,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lng),
    }))
    .filter(r => !isNaN(r.lat) && !isNaN(r.lng))
}

export function parseClusters(records) {
  return records.map(r => ({
    ...r,
    lat: Number(r.lat),
    lng: Number(r.lng),
  }))
}

async function fetchJson(path, params) {
  const url = buildUrl(path, params)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`PBDB API error: ${response.status}`)
  }
  const data = await response.json()
  return data.records || []
}

export async function fetchClusters(filters = {}) {
  const params = {
    level: 2,
    base_name: filters.taxon,
    interval: filters.interval,
    min_ma: filters.ageMin,
    max_ma: filters.ageMax,
  }
  const records = await fetchJson('/occs/geosum.json', params)
  return parseClusters(records)
}

export async function fetchOccurrences(bounds, filters = {}) {
  const params = {
    lngmin: bounds.west,
    lngmax: bounds.east,
    latmin: bounds.south,
    latmax: bounds.north,
    base_name: filters.taxon,
    interval: filters.interval,
    min_ma: filters.ageMin,
    max_ma: filters.ageMax,
    show: 'coords,loc,time,class',
    limit: 500,
  }
  const records = await fetchJson('/occs/list.json', params)
  return parseOccurrences(records)
}

export async function fetchTaxonAutocomplete(name) {
  if (!name || name.length < 2) return []
  const records = await fetchJson('/taxa/auto.json', { name, limit: 10 })
  return records
}

export async function fetchTaxonDetail(name) {
  const records = await fetchJson('/taxa/single.json', {
    name,
    show: 'app,size,ecospace,img',
  })
  return records[0] || null
}

export async function fetchIntervals() {
  const records = await fetchJson('/intervals/list.json', { scale: 1 })
  return records
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/__tests__/pbdb.test.js
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/api/pbdb.js src/__tests__/pbdb.test.js
git commit -m "feat: add PBDB API service with URL builder and response parsers"
```

---

### Task 5: Debounce Hook

**Files:**
- Create: `src/hooks/useDebounce.js`, `src/__tests__/useDebounce.test.js`

> **React concept — Custom hooks:** Hooks are functions that let you "hook into" React features like state and lifecycle. A custom hook is a function starting with `use` that combines built-in hooks to create reusable logic. `useDebounce` delays a value from updating until the user stops changing it — perfect for not hammering the API on every pixel of map pan.

- [ ] **Step 1: Write the debounce hook test**

Create `src/__tests__/useDebounce.test.js`:

```js
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '../hooks/useDebounce'

describe('useDebounce', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300))
    expect(result.current).toBe('hello')
  })

  it('debounces value updates', async () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'hello' } }
    )

    rerender({ value: 'world' })
    expect(result.current).toBe('hello')

    await act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe('world')

    vi.useRealTimers()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/useDebounce.test.js
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the hook**

Create `src/hooks/useDebounce.js`:

```js
import { useState, useEffect } from 'react'

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/__tests__/useDebounce.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useDebounce.js src/__tests__/useDebounce.test.js
git commit -m "feat: add useDebounce hook for map movement throttling"
```

---

### Task 6: Map Event Handler & Data Loading

**Files:**
- Create: `src/components/MapEventHandler.jsx`
- Modify: `src/App.jsx`, `src/components/MapView.jsx`

> **React concept — State & useEffect:** `useState` creates a piece of data that React tracks. When it changes, React re-renders the component. `useEffect` runs side effects (like API calls) when certain values change. Here, App holds the shared state (fossils, filters, map position) and passes it down to child components as **props** — inputs that a component receives from its parent.

- [ ] **Step 1: Create the MapEventHandler component**

Create `src/components/MapEventHandler.jsx`:

```jsx
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
```

> **React concept — Why does this component return `null`?** Not every component draws something on screen. This one just listens to map events and calls a callback. It's an "invisible" component that hooks into the Leaflet map via `useMapEvents`. It must be a child of `<MapContainer>` to access the map instance.

- [ ] **Step 2: Wire up App with state and data fetching**

Update `src/App.jsx`:

```jsx
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
```

> **React concept — useCallback:** `useCallback` memoizes a function so it doesn't get re-created on every render. Without it, `handleViewChange` would be a new function each render, causing MapEventHandler to re-render unnecessarily. It's an optimization — the function stays the same between renders as long as its dependencies don't change.

- [ ] **Step 3: Update MapView to accept props and include the event handler**

Update `src/components/MapView.jsx`:

```jsx
import { MapContainer, TileLayer } from 'react-leaflet'
import MapEventHandler from './MapEventHandler'
import './MapView.css'

const INITIAL_CENTER = [20, 0]
const INITIAL_ZOOM = 3
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'

function MapView({ onViewChange, fossils }) {
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
      <MapEventHandler onViewChange={onViewChange} />
    </MapContainer>
  )
}

export default MapView
```

- [ ] **Step 4: Add loading/error indicator styles**

Append to `src/App.css`:

```css
.loading-indicator {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1000;
  font-family: var(--font-body);
  font-size: 0.75rem;
  letter-spacing: 1px;
  color: var(--color-gold);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--color-gold-border);
  border-radius: 20px;
  padding: 8px 16px;
}

.error-indicator {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1000;
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: #e74c3c;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 20px;
  padding: 8px 16px;
}
```

- [ ] **Step 5: Verify data loading**

```bash
npm run dev
```

Expected: Open browser, see the dark map. Pan/zoom the map — after a 300ms pause, the "Loading fossils..." indicator should briefly appear (top right). Open browser DevTools Network tab to confirm PBDB API calls are being made. At zoom 3 (initial), you should see `geosum.json` requests. Zoom in past level 5 and you should see `occs/list.json` requests with bounding box params.

- [ ] **Step 6: Commit**

```bash
git add src/components/MapEventHandler.jsx src/components/MapView.jsx src/App.jsx src/App.css
git commit -m "feat: wire up map events to load fossil data from PBDB API"
```

---

### Task 7: Fossil Markers

**Files:**
- Create: `src/components/FossilMarkers.jsx`, `src/components/FossilMarkers.css`
- Modify: `src/components/MapView.jsx`

> **React concept — Rendering lists:** When you have an array of data, you use `.map()` to turn each item into a component. React needs a unique `key` prop on each item so it can efficiently update the list when data changes. Here we map over fossil records to create markers.

- [ ] **Step 1: Create FossilMarkers component**

Create `src/components/FossilMarkers.jsx`:

```jsx
import { Marker, Popup } from 'react-leaflet'
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

function FossilMarkers({ fossils, zoom, onFossilClick }) {
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
          eventHandlers={{
            click: () => onFossilClick(fossil),
          }}
        />
      ))}
    </MarkerClusterGroup>
  )
}

export default FossilMarkers
```

- [ ] **Step 2: Create marker CSS**

Create `src/components/FossilMarkers.css`:

```css
/* Individual fossil marker — glowing amber dot */
.fossil-marker {
  background: none !important;
  border: none !important;
}

.fossil-marker-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: radial-gradient(circle, #f0c040 0%, #d4a030 60%, #8b6914 100%);
  box-shadow: 0 0 20px rgba(212, 169, 89, 0.5), 0 0 40px rgba(212, 169, 89, 0.2);
  border: 2px solid rgba(240, 200, 80, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.fossil-marker-dot:hover {
  transform: scale(1.3);
  box-shadow: 0 0 30px rgba(212, 169, 89, 0.7), 0 0 60px rgba(212, 169, 89, 0.3);
}

/* Cluster markers — amber circles with count */
.fossil-cluster {
  background: none !important;
  border: none !important;
}

.fossil-cluster-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212, 169, 89, 0.9), rgba(139, 105, 20, 0.8));
  box-shadow: 0 0 20px rgba(212, 169, 89, 0.4), 0 0 40px rgba(212, 169, 89, 0.15);
  border: 2px solid rgba(240, 200, 80, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--color-base);
}

.fossil-cluster-large .fossil-cluster-inner {
  width: 50px;
  height: 50px;
  font-size: 0.8rem;
}

.fossil-cluster-medium .fossil-cluster-inner {
  width: 40px;
  height: 40px;
}

.fossil-cluster-small .fossil-cluster-inner {
  width: 30px;
  height: 30px;
  font-size: 0.65rem;
}
```

- [ ] **Step 3: Add FossilMarkers to MapView**

Update `src/components/MapView.jsx`:

```jsx
import { useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import MapEventHandler from './MapEventHandler'
import FossilMarkers from './FossilMarkers'
import './MapView.css'

const INITIAL_CENTER = [20, 0]
const INITIAL_ZOOM = 3
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'

function MapView({ onViewChange, fossils }) {
  const [zoom, setZoom] = useState(INITIAL_ZOOM)
  const [selectedFossil, setSelectedFossil] = useState(null)

  function handleViewChange(view) {
    setZoom(view.zoom)
    onViewChange(view)
  }

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
      <MapEventHandler onViewChange={handleViewChange} />
      <FossilMarkers
        fossils={fossils}
        zoom={zoom}
        onFossilClick={setSelectedFossil}
      />
    </MapContainer>
  )
}

export default MapView
```

- [ ] **Step 4: Verify markers render**

```bash
npm run dev
```

Expected: After the map loads, you should see amber cluster circles scattered across the world at zoom level 3. Each shows a count number. Zoom in past level 5 and individual glowing amber dots should appear. Dots should glow brighter on hover.

- [ ] **Step 5: Commit**

```bash
git add src/components/FossilMarkers.jsx src/components/FossilMarkers.css src/components/MapView.jsx
git commit -m "feat: add glowing amber fossil markers with clustering"
```

---

### Task 8: Fossil Popup

**Files:**
- Create: `src/components/FossilPopup.jsx`, `src/components/FossilPopup.css`
- Modify: `src/components/FossilMarkers.jsx`

> **React concept — Conditional rendering:** Sometimes you want to show something only when a condition is met. In JSX, you use `{condition && <Component />}` — if `condition` is true, the component renders. If false, nothing renders. We use this for the popup's "Explore" button behavior.

- [ ] **Step 1: Create FossilPopup component**

Create `src/components/FossilPopup.jsx`:

```jsx
import './FossilPopup.css'

function FossilPopup({ fossil, onExplore }) {
  const location = [fossil.state, fossil.cc].filter(Boolean).join(', ')

  return (
    <div className="fossil-popup">
      <div className="fossil-popup-accent" />
      <div className="fossil-popup-era label">
        {fossil.early_interval || 'Unknown Period'}
      </div>
      <div className="fossil-popup-name">
        {fossil.accepted_name || fossil.identified_name || 'Unknown'}
      </div>
      {location && (
        <div className="fossil-popup-location">{location}</div>
      )}
      <div className="fossil-popup-age">
        {fossil.max_ma && fossil.min_ma
          ? `${fossil.max_ma} – ${fossil.min_ma} Ma`
          : 'Age unknown'}
      </div>
      <div className="fossil-popup-divider" />
      <div className="fossil-popup-actions">
        <button
          className="fossil-popup-explore"
          onClick={() => onExplore(fossil)}
        >
          EXPLORE &rarr;
        </button>
      </div>
    </div>
  )
}

export default FossilPopup
```

- [ ] **Step 2: Create popup CSS**

Create `src/components/FossilPopup.css`:

```css
.fossil-popup {
  min-width: 180px;
  padding: 4px 0;
}

.fossil-popup-accent {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212, 169, 89, 0.5), transparent);
  margin-bottom: 8px;
}

.fossil-popup-era {
  color: var(--color-gold);
  margin-bottom: 4px;
}

.fossil-popup-name {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: bold;
  color: var(--color-text);
  line-height: 1.2;
}

.fossil-popup-location {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.fossil-popup-age {
  font-size: 0.7rem;
  color: var(--color-gold-muted);
  margin-top: 2px;
}

.fossil-popup-divider {
  height: 1px;
  background: var(--color-gold-border);
  margin: 8px 0;
}

.fossil-popup-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fossil-popup-explore {
  background: none;
  border: none;
  color: var(--color-gold);
  font-family: var(--font-body);
  font-size: 0.7rem;
  letter-spacing: 1px;
  cursor: pointer;
  padding: 0;
  transition: color var(--transition-smooth);
}

.fossil-popup-explore:hover {
  color: var(--color-text);
}

/* Override Leaflet's default popup styles for cinematic theme */
.leaflet-popup-content-wrapper {
  background: var(--color-surface) !important;
  border: 1px solid var(--color-gold-border) !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 60px rgba(212, 169, 89, 0.08) !important;
  color: var(--color-text) !important;
}

.leaflet-popup-content {
  margin: 12px 16px !important;
  line-height: 1.4 !important;
}

.leaflet-popup-tip {
  background: var(--color-surface) !important;
  border: 1px solid var(--color-gold-border) !important;
  box-shadow: none !important;
}

.leaflet-popup-close-button {
  color: var(--color-gold-muted) !important;
  font-size: 18px !important;
  top: 6px !important;
  right: 8px !important;
}

.leaflet-popup-close-button:hover {
  color: var(--color-gold) !important;
}
```

- [ ] **Step 3: Wire popup into FossilMarkers**

Update the individual marker rendering in `src/components/FossilMarkers.jsx`. Replace the `<Marker>` inside the `<MarkerClusterGroup>` with:

```jsx
import { Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import FossilPopup from './FossilPopup'
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

function FossilMarkers({ fossils, zoom, onFossilClick, onExplore }) {
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
          <Popup>
            <FossilPopup fossil={fossil} onExplore={onExplore} />
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  )
}

export default FossilMarkers
```

- [ ] **Step 4: Pass onExplore through MapView and App**

Update `src/components/MapView.jsx` — add `onExplore` prop and pass it to FossilMarkers:

```jsx
import { useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import MapEventHandler from './MapEventHandler'
import FossilMarkers from './FossilMarkers'
import './MapView.css'

const INITIAL_CENTER = [20, 0]
const INITIAL_ZOOM = 3
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'

function MapView({ onViewChange, fossils, onExplore }) {
  const [zoom, setZoom] = useState(INITIAL_ZOOM)

  function handleViewChange(view) {
    setZoom(view.zoom)
    onViewChange(view)
  }

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
      <MapEventHandler onViewChange={handleViewChange} />
      <FossilMarkers
        fossils={fossils}
        zoom={zoom}
        onExplore={onExplore}
      />
    </MapContainer>
  )
}

export default MapView
```

Update `src/App.jsx` — add `detailFossil` state and pass `onExplore`:

```jsx
import { useState, useEffect, useCallback } from 'react'
import MapView from './components/MapView'
import { fetchClusters, fetchOccurrences } from './api/pbdb'
import { useDebounce } from './hooks/useDebounce'

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
      <MapView
        onViewChange={handleViewChange}
        fossils={fossils}
        onExplore={handleExplore}
      />
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
```

- [ ] **Step 5: Verify popups**

```bash
npm run dev
```

Expected: Zoom in to a region with fossils (e.g., western USA). Click an amber dot — a dark cinematic popup appears with the species name, period, location, age, and an "EXPLORE" link. The popup has the gold accent line at top and dark surface background.

- [ ] **Step 6: Commit**

```bash
git add src/components/FossilPopup.jsx src/components/FossilPopup.css src/components/FossilMarkers.jsx src/components/MapView.jsx src/App.jsx
git commit -m "feat: add cinematic fossil popups with species info and explore link"
```

---

### Task 9: Search Bar with Autocomplete

**Files:**
- Create: `src/components/SearchBar.jsx`, `src/components/SearchBar.css`
- Modify: `src/App.jsx`

> **React concept — Controlled inputs:** In React, form inputs can be "controlled" — their value comes from state, and typing fires an `onChange` handler that updates the state. This gives you full control: you can debounce the search, validate input, or transform it. The input is always in sync with your state.

- [ ] **Step 1: Create SearchBar component**

Create `src/components/SearchBar.jsx`:

```jsx
import { useState, useEffect, useRef } from 'react'
import { fetchTaxonAutocomplete } from '../api/pbdb'
import { useDebounce } from '../hooks/useDebounce'
import './SearchBar.css'

function SearchBar({ onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([])
      return
    }

    let cancelled = false
    fetchTaxonAutocomplete(debouncedQuery).then((data) => {
      if (!cancelled) {
        setResults(data)
        setIsOpen(true)
      }
    })
    return () => { cancelled = true }
  }, [debouncedQuery])

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(taxon) {
    setQuery(taxon.taxon_name)
    setIsOpen(false)
    onSelect(taxon.taxon_name)
  }

  function handleClear() {
    setQuery('')
    setResults([])
    setIsOpen(false)
    onSelect('')
  }

  return (
    <div className="search-bar" ref={wrapperRef}>
      <div className="search-bar-input-wrapper glass">
        <span className="search-bar-icon">&#128269;</span>
        <input
          type="text"
          className="search-bar-input"
          placeholder="Search ancient life..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
        />
        {query && (
          <button className="search-bar-clear" onClick={handleClear}>
            &times;
          </button>
        )}
      </div>
      {isOpen && results.length > 0 && (
        <ul className="search-bar-results glass">
          {results.map((taxon) => (
            <li
              key={taxon.taxon_no}
              className="search-bar-result"
              onClick={() => handleSelect(taxon)}
            >
              <span className="search-bar-result-name">{taxon.taxon_name}</span>
              <span className="search-bar-result-meta">
                {taxon.taxon_rank} &middot; {parseInt(taxon.n_occs).toLocaleString()} occurrences
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SearchBar
```

> **React concept — useRef:** `useRef` creates a persistent reference that doesn't cause re-renders when changed. Here we use it to get a reference to the DOM element so we can detect clicks outside the dropdown to close it. Unlike state, changing a ref doesn't re-render.

- [ ] **Step 2: Create SearchBar CSS**

Create `src/components/SearchBar.css`:

```css
.search-bar {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: 100%;
  max-width: 420px;
  padding: 0 16px;
}

.search-bar-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 24px;
  padding: 10px 18px;
}

.search-bar-icon {
  font-size: 0.9rem;
  opacity: 0.5;
}

.search-bar-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 0.9rem;
}

.search-bar-input::placeholder {
  color: var(--color-gold-muted);
}

.search-bar-clear {
  background: none;
  border: none;
  color: var(--color-gold-muted);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.search-bar-clear:hover {
  color: var(--color-gold);
}

.search-bar-results {
  list-style: none;
  margin-top: 8px;
  border-radius: 12px;
  overflow: hidden;
  max-height: 300px;
  overflow-y: auto;
}

.search-bar-result {
  padding: 10px 18px;
  cursor: pointer;
  transition: background var(--transition-smooth);
  border-bottom: 1px solid var(--color-gold-border);
}

.search-bar-result:last-child {
  border-bottom: none;
}

.search-bar-result:hover {
  background: var(--color-gold-subtle);
}

.search-bar-result-name {
  display: block;
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: 0.9rem;
  font-style: italic;
}

.search-bar-result-meta {
  display: block;
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  margin-top: 2px;
}
```

- [ ] **Step 3: Add SearchBar to App**

Update `src/App.jsx` — add SearchBar import and render it, wire `onSelect` to update filters:

Add import at top:
```jsx
import SearchBar from './components/SearchBar'
```

Add handler after `handleExplore`:
```jsx
const handleSearch = useCallback((taxonName) => {
  setFilters((prev) => ({ ...prev, taxon: taxonName }))
}, [])
```

Add `<SearchBar>` inside the return, after `<MapView>`:
```jsx
<SearchBar onSelect={handleSearch} />
```

- [ ] **Step 4: Verify search works**

```bash
npm run dev
```

Expected: Type "tyranno" in the search bar — after a brief pause, a dropdown appears with matching taxon names (Tyrannosaurus, Tyrannosauridae, etc.) with occurrence counts. Click one — the map should reload with only fossils of that organism.

- [ ] **Step 5: Commit**

```bash
git add src/components/SearchBar.jsx src/components/SearchBar.css src/App.jsx
git commit -m "feat: add search bar with PBDB autocomplete"
```

---

### Task 10: Detail Panel

**Files:**
- Create: `src/components/DetailPanel.jsx`, `src/components/DetailPanel.css`
- Modify: `src/App.jsx`

> **React concept — useEffect for data fetching:** When a user clicks "Explore" we have the basic fossil occurrence data, but we want richer detail (ecology, first appearance, taxonomy). We use `useEffect` to fetch that extra data when `detailFossil` changes. The effect runs every time its dependency changes — perfect for "when X changes, do Y."

- [ ] **Step 1: Create DetailPanel component**

Create `src/components/DetailPanel.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { fetchTaxonDetail } from '../api/pbdb'
import './DetailPanel.css'

function DetailPanel({ fossil, onClose, isFavorite, onToggleFavorite }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!fossil) return

    let cancelled = false
    setLoading(true)

    const name = fossil.accepted_name || fossil.identified_name
    if (name) {
      fetchTaxonDetail(name).then((data) => {
        if (!cancelled) {
          setDetail(data)
          setLoading(false)
        }
      }).catch(() => {
        if (!cancelled) setLoading(false)
      })
    }

    return () => { cancelled = true }
  }, [fossil])

  if (!fossil) return null

  const name = fossil.accepted_name || fossil.identified_name || 'Unknown'
  const location = [fossil.state, fossil.cc].filter(Boolean).join(', ')

  const taxonomy = [
    ['Phylum', fossil.phylum],
    ['Class', fossil.class],
    ['Order', fossil.order === 'NO_ORDER_SPECIFIED' ? null : fossil.order],
    ['Family', fossil.family],
    ['Genus', fossil.genus],
  ].filter(([, v]) => v)

  const ecologyTags = detail
    ? [detail.diet, detail.life_habit, detail.motility, detail.taxon_environment]
        .filter(Boolean)
        .flatMap(tag => tag.split(', '))
    : []

  return (
    <div className="detail-panel-overlay" onClick={onClose}>
      <div className="detail-panel glass" onClick={(e) => e.stopPropagation()}>
        <div className="detail-panel-accent accent-line" />

        <button className="detail-panel-close" onClick={onClose}>&times;</button>

        {/* Header */}
        <div className="detail-panel-header">
          <div className="label">{fossil.early_interval || 'Unknown Period'}</div>
          <h2 className="detail-panel-name">{name}</h2>
          {fossil.identified_name && fossil.identified_name !== name && (
            <div className="detail-panel-alt-name">{fossil.identified_name}</div>
          )}
        </div>

        {/* Key facts */}
        <div className="detail-panel-facts">
          <div className="detail-panel-fact">
            <div className="label">Era</div>
            <div className="detail-panel-fact-value">
              {detail?.early_interval || fossil.early_interval || '—'}
            </div>
          </div>
          <div className="detail-panel-fact">
            <div className="label">Period</div>
            <div className="detail-panel-fact-value">
              {detail?.late_interval || fossil.early_interval || '—'}
            </div>
          </div>
          <div className="detail-panel-fact">
            <div className="label">Age</div>
            <div className="detail-panel-fact-value">
              {fossil.max_ma && fossil.min_ma ? `${fossil.max_ma}–${fossil.min_ma} Ma` : '—'}
            </div>
          </div>
        </div>

        {/* Taxonomy */}
        {taxonomy.length > 0 && (
          <div className="detail-panel-section">
            <div className="label">Classification</div>
            <div className="detail-panel-taxonomy">
              {taxonomy.map(([rank, value]) => (
                <div key={rank} className="detail-panel-taxonomy-row">
                  <span className="detail-panel-taxonomy-rank">{rank}</span>
                  <span className="detail-panel-taxonomy-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discovery site */}
        <div className="detail-panel-section">
          <div className="label">Discovery Site</div>
          {fossil.formation && (
            <div className="detail-panel-site-name">{fossil.formation}</div>
          )}
          {location && <div className="detail-panel-site-location">{location}</div>}
          <div className="detail-panel-site-coords">
            {fossil.lat.toFixed(2)}&deg;N, {fossil.lng.toFixed(2)}&deg;W
          </div>
        </div>

        {/* Ecology tags */}
        {ecologyTags.length > 0 && (
          <div className="detail-panel-section">
            <div className="label">Ecology</div>
            <div className="detail-panel-tags">
              {ecologyTags.map((tag) => (
                <span key={tag} className="detail-panel-tag">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Loading state for extra detail */}
        {loading && (
          <div className="detail-panel-loading">Loading details...</div>
        )}

        {/* Actions */}
        <div className="detail-panel-actions">
          <button
            className="detail-panel-action"
            onClick={() => onToggleFavorite(fossil.occurrence_no)}
          >
            {isFavorite ? '\u2665 SAVED' : '\u2661 SAVE'}
          </button>
          <a
            className="detail-panel-action"
            href={`https://paleobiodb.org/classic/checkTaxonInfo?taxon_no=${fossil.accepted_no || fossil.identified_no}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            &#8599; PBDB
          </a>
        </div>
      </div>
    </div>
  )
}

export default DetailPanel
```

- [ ] **Step 2: Create DetailPanel CSS**

Create `src/components/DetailPanel.css`:

```css
.detail-panel-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: flex-end;
  animation: fadeIn 0.2s ease;
}

.detail-panel {
  width: 360px;
  max-width: 90vw;
  height: 100%;
  overflow-y: auto;
  padding: 0;
  position: relative;
  animation: slideIn 0.3s ease;
  border-left: 1px solid var(--color-gold-border);
  border-radius: 0;
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.detail-panel-accent {
  position: absolute;
  top: 0;
  left: 20px;
  right: 20px;
}

.detail-panel-close {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  color: var(--color-gold-muted);
  font-size: 1.4rem;
  cursor: pointer;
  z-index: 1;
  line-height: 1;
}

.detail-panel-close:hover {
  color: var(--color-gold);
}

.detail-panel-header {
  padding: 24px 20px 16px;
  border-bottom: 1px solid var(--color-gold-border);
}

.detail-panel-name {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: bold;
  color: var(--color-text);
  line-height: 1.2;
  margin-top: 6px;
}

.detail-panel-alt-name {
  font-size: 0.75rem;
  font-style: italic;
  color: var(--color-gold-muted);
  margin-top: 4px;
}

.detail-panel-facts {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  border-bottom: 1px solid var(--color-gold-border);
}

.detail-panel-fact {
  padding: 12px;
  text-align: center;
  border-right: 1px solid rgba(212, 169, 89, 0.08);
}

.detail-panel-fact:last-child {
  border-right: none;
}

.detail-panel-fact-value {
  color: var(--color-gold);
  font-size: 0.85rem;
  margin-top: 4px;
}

.detail-panel-section {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-gold-border);
}

.detail-panel-section .label {
  margin-bottom: 10px;
}

.detail-panel-taxonomy {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-panel-taxonomy-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.detail-panel-taxonomy-rank {
  color: var(--color-gold-muted);
}

.detail-panel-taxonomy-value {
  color: var(--color-text);
}

.detail-panel-site-name {
  color: var(--color-text);
  font-size: 0.9rem;
}

.detail-panel-site-location {
  color: var(--color-gold-muted);
  font-size: 0.8rem;
  margin-top: 2px;
}

.detail-panel-site-coords {
  color: var(--color-gold-muted);
  font-size: 0.7rem;
  margin-top: 2px;
  opacity: 0.6;
}

.detail-panel-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.detail-panel-tag {
  background: var(--color-gold-subtle);
  border: 1px solid var(--color-gold-border);
  color: var(--color-text);
  font-size: 0.7rem;
  padding: 4px 10px;
  border-radius: 12px;
}

.detail-panel-loading {
  padding: 12px 20px;
  color: var(--color-gold-muted);
  font-size: 0.75rem;
  text-align: center;
}

.detail-panel-actions {
  padding: 16px 20px;
  display: flex;
  gap: 10px;
}

.detail-panel-action {
  flex: 1;
  background: var(--color-gold-subtle);
  border: 1px solid var(--color-gold-border);
  color: var(--color-gold);
  font-family: var(--font-body);
  font-size: 0.7rem;
  letter-spacing: 1px;
  padding: 10px;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  text-decoration: none;
  transition: background var(--transition-smooth);
}

.detail-panel-action:hover {
  background: var(--color-gold-border);
}

/* Mobile: slide from bottom */
@media (max-width: 640px) {
  .detail-panel-overlay {
    align-items: flex-end;
  }

  .detail-panel {
    width: 100%;
    max-width: 100%;
    height: 80vh;
    border-radius: 16px 16px 0 0;
    border-left: none;
    border-top: 1px solid var(--color-gold-border);
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
}
```

- [ ] **Step 3: Wire DetailPanel into App**

Update `src/App.jsx` — add import and render:

Add import at top:
```jsx
import DetailPanel from './components/DetailPanel'
```

Add state for favorites (temporary, will be replaced by hook in Task 13):
```jsx
const [favorites, setFavorites] = useState([])

const handleToggleFavorite = useCallback((occurrenceNo) => {
  setFavorites((prev) =>
    prev.includes(occurrenceNo)
      ? prev.filter((id) => id !== occurrenceNo)
      : [...prev, occurrenceNo]
  )
}, [])
```

Add DetailPanel inside the return, after the error indicator:
```jsx
<DetailPanel
  fossil={detailFossil}
  onClose={() => setDetailFossil(null)}
  isFavorite={detailFossil ? favorites.includes(detailFossil.occurrence_no) : false}
  onToggleFavorite={handleToggleFavorite}
/>
```

- [ ] **Step 4: Verify detail panel**

```bash
npm run dev
```

Expected: Zoom into a region, click a fossil marker to see the popup. Click "EXPLORE" — the detail panel slides in from the right with the gold accent line, species name, era/period/age facts, taxonomy tree, discovery site, ecology tags (if available), and action buttons. Click the dimmed overlay or X to close. On mobile-sized window, panel slides up from bottom.

- [ ] **Step 5: Commit**

```bash
git add src/components/DetailPanel.jsx src/components/DetailPanel.css src/App.jsx
git commit -m "feat: add slide-in detail panel with taxonomy, ecology, and actions"
```

---

### Task 11: Filter Panel & Filter Chips

**Files:**
- Create: `src/components/FilterPanel.jsx`, `src/components/FilterPanel.css`, `src/components/FilterChips.jsx`, `src/components/FilterChips.css`
- Modify: `src/App.jsx`

> **React concept — Lifting state up:** When multiple components need access to the same data, we "lift" the state to their closest common ancestor. Filters affect both the map markers AND the filter chips display, so the filter state lives in App and gets passed down to both components as props.

- [ ] **Step 1: Create FilterChips component**

Create `src/components/FilterChips.jsx`:

```jsx
import './FilterChips.css'

function FilterChips({ filters, onRemove, onOpenPanel }) {
  const activeFilters = []

  if (filters.taxon) {
    activeFilters.push({ key: 'taxon', label: filters.taxon })
  }
  if (filters.interval) {
    activeFilters.push({ key: 'interval', label: filters.interval })
  }
  if (filters.ageMin || filters.ageMax) {
    const label = `${filters.ageMax || '?'} – ${filters.ageMin || '?'} Ma`
    activeFilters.push({ key: 'age', label })
  }

  return (
    <div className="filter-chips">
      {activeFilters.map(({ key, label }) => (
        <button key={key} className="filter-chip glass" onClick={() => onRemove(key)}>
          {label}
          <span className="filter-chip-close">&times;</span>
        </button>
      ))}
      <button className="filter-chip filter-chip-add" onClick={onOpenPanel}>
        + Filters
      </button>
    </div>
  )
}

export default FilterChips
```

- [ ] **Step 2: Create FilterChips CSS**

Create `src/components/FilterChips.css`:

```css
.filter-chips {
  position: fixed;
  top: 68px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 420px;
  padding: 0 16px;
}

.filter-chip {
  font-family: var(--font-body);
  font-size: 0.7rem;
  color: var(--color-gold);
  padding: 4px 12px;
  border-radius: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background var(--transition-smooth);
}

.filter-chip:hover {
  background: var(--color-gold-subtle);
}

.filter-chip-close {
  font-size: 0.9rem;
  line-height: 1;
  opacity: 0.6;
}

.filter-chip-add {
  background: rgba(212, 169, 89, 0.08);
  border: 1px solid rgba(212, 169, 89, 0.15);
  color: var(--color-text-secondary);
}

.filter-chip-add:hover {
  border-color: var(--color-gold-border);
  color: var(--color-gold);
}
```

- [ ] **Step 3: Create FilterPanel component**

Create `src/components/FilterPanel.jsx`:

```jsx
import { useState } from 'react'
import './FilterPanel.css'

const MAJOR_TAXA = [
  'Dinosauria',
  'Mammalia',
  'Plantae',
  'Mollusca',
  'Arthropoda',
  'Pisces',
  'Amphibia',
  'Reptilia',
  'Aves',
]

const GEOLOGICAL_PERIODS = [
  'Cambrian',
  'Ordovician',
  'Silurian',
  'Devonian',
  'Carboniferous',
  'Permian',
  'Triassic',
  'Jurassic',
  'Cretaceous',
  'Paleogene',
  'Neogene',
  'Quaternary',
]

function FilterPanel({ filters, onApply, onClose }) {
  const [localFilters, setLocalFilters] = useState({ ...filters })

  function handleTaxonClick(taxon) {
    setLocalFilters((prev) => ({
      ...prev,
      taxon: prev.taxon === taxon ? '' : taxon,
    }))
  }

  function handlePeriodChange(e) {
    setLocalFilters((prev) => ({
      ...prev,
      interval: e.target.value,
    }))
  }

  function handleApply() {
    onApply(localFilters)
    onClose()
  }

  function handleClear() {
    const cleared = { taxon: '', interval: '', ageMin: '', ageMax: '' }
    setLocalFilters(cleared)
    onApply(cleared)
    onClose()
  }

  return (
    <div className="filter-panel-overlay" onClick={onClose}>
      <div className="filter-panel glass" onClick={(e) => e.stopPropagation()}>
        <div className="filter-panel-accent accent-line" />

        <div className="filter-panel-header">
          <h3 className="filter-panel-title">Filters</h3>
          <button className="filter-panel-close" onClick={onClose}>&times;</button>
        </div>

        {/* Taxon filter */}
        <div className="filter-panel-section">
          <div className="label">Organism Group</div>
          <div className="filter-panel-taxa">
            {MAJOR_TAXA.map((taxon) => (
              <button
                key={taxon}
                className={`filter-panel-taxon ${localFilters.taxon === taxon ? 'active' : ''}`}
                onClick={() => handleTaxonClick(taxon)}
              >
                {taxon}
              </button>
            ))}
          </div>
        </div>

        {/* Period dropdown */}
        <div className="filter-panel-section">
          <div className="label">Geological Period</div>
          <select
            className="filter-panel-select"
            value={localFilters.interval}
            onChange={handlePeriodChange}
          >
            <option value="">All periods</option>
            {GEOLOGICAL_PERIODS.map((period) => (
              <option key={period} value={period}>{period}</option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="filter-panel-actions">
          <button className="filter-panel-clear" onClick={handleClear}>
            Clear All
          </button>
          <button className="filter-panel-apply" onClick={handleApply}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}

export default FilterPanel
```

- [ ] **Step 4: Create FilterPanel CSS**

Create `src/components/FilterPanel.css`:

```css
.filter-panel-overlay {
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

.filter-panel {
  width: 400px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  border-radius: 16px;
  position: relative;
  animation: scaleIn 0.2s ease;
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.filter-panel-accent {
  position: absolute;
  top: 0;
  left: 20px;
  right: 20px;
}

.filter-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 12px;
}

.filter-panel-title {
  font-family: var(--font-display);
  color: var(--color-text);
  font-size: 1.1rem;
}

.filter-panel-close {
  background: none;
  border: none;
  color: var(--color-gold-muted);
  font-size: 1.4rem;
  cursor: pointer;
}

.filter-panel-close:hover {
  color: var(--color-gold);
}

.filter-panel-section {
  padding: 12px 20px;
  border-top: 1px solid var(--color-gold-border);
}

.filter-panel-section .label {
  margin-bottom: 10px;
}

.filter-panel-taxa {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.filter-panel-taxon {
  background: var(--color-gold-subtle);
  border: 1px solid var(--color-gold-border);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 0.75rem;
  padding: 6px 12px;
  border-radius: 16px;
  cursor: pointer;
  transition: all var(--transition-smooth);
}

.filter-panel-taxon:hover {
  background: var(--color-gold-border);
}

.filter-panel-taxon.active {
  background: var(--color-gold);
  color: var(--color-base);
  border-color: var(--color-gold);
}

.filter-panel-select {
  width: 100%;
  background: var(--color-surface);
  border: 1px solid var(--color-gold-border);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 0.85rem;
  padding: 8px 12px;
  border-radius: 8px;
  outline: none;
  cursor: pointer;
}

.filter-panel-select:focus {
  border-color: var(--color-gold);
}

.filter-panel-select option {
  background: var(--color-surface);
  color: var(--color-text);
}

.filter-panel-actions {
  display: flex;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid var(--color-gold-border);
}

.filter-panel-clear {
  flex: 1;
  background: none;
  border: 1px solid var(--color-gold-border);
  color: var(--color-gold-muted);
  font-family: var(--font-body);
  font-size: 0.8rem;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--transition-smooth);
}

.filter-panel-clear:hover {
  border-color: var(--color-gold);
  color: var(--color-gold);
}

.filter-panel-apply {
  flex: 1;
  background: var(--color-gold);
  border: none;
  color: var(--color-base);
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity var(--transition-smooth);
}

.filter-panel-apply:hover {
  opacity: 0.9;
}

/* Mobile: full-screen */
@media (max-width: 640px) {
  .filter-panel {
    width: 100%;
    max-width: 100%;
    max-height: 100%;
    height: 100%;
    border-radius: 0;
  }
}
```

- [ ] **Step 5: Wire filters into App**

Update `src/App.jsx` — add imports and state:

Add imports:
```jsx
import FilterChips from './components/FilterChips'
import FilterPanel from './components/FilterPanel'
```

Add state:
```jsx
const [filterPanelOpen, setFilterPanelOpen] = useState(false)
```

Add handlers:
```jsx
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
```

Add components to the return JSX, after SearchBar:
```jsx
<FilterChips
  filters={filters}
  onRemove={handleRemoveFilter}
  onOpenPanel={() => setFilterPanelOpen(true)}
/>
{filterPanelOpen && (
  <FilterPanel
    filters={filters}
    onApply={handleApplyFilters}
    onClose={() => setFilterPanelOpen(false)}
  />
)}
```

- [ ] **Step 6: Verify filters**

```bash
npm run dev
```

Expected: Click "+ Filters" chip — the filter panel appears centered with organism group buttons and period dropdown. Select "Dinosauria" (it highlights gold), pick "Jurassic" from the dropdown, click "Apply Filters" — map reloads with filtered data and chips appear showing "Dinosauria" and "Jurassic". Click the X on a chip to remove that filter.

- [ ] **Step 7: Commit**

```bash
git add src/components/FilterChips.jsx src/components/FilterChips.css src/components/FilterPanel.jsx src/components/FilterPanel.css src/App.jsx
git commit -m "feat: add filter panel with taxon and period filters, plus active filter chips"
```

---

### Task 12: Timeline Slider

**Files:**
- Create: `src/components/TimelineSlider.jsx`, `src/components/TimelineSlider.css`
- Modify: `src/App.jsx`

> **React concept — Controlled range inputs:** Just like text inputs, range sliders can be controlled by React state. We use two range inputs (min and max age) layered on top of a colored bar. When either changes, we update the filter state, which triggers a new API call.

- [ ] **Step 1: Create TimelineSlider component**

Create `src/components/TimelineSlider.jsx`:

```jsx
import { useState, useEffect } from 'react'
import './TimelineSlider.css'

const MAX_AGE = 541
const MIN_AGE = 0

const ERAS = [
  { name: 'Paleozoic', start: 541, end: 252, color: '#7fa67f' },
  { name: 'Mesozoic', start: 252, end: 66, color: '#c8a040' },
  { name: 'Cenozoic', start: 66, end: 0, color: '#d4a070' },
]

function TimelineSlider({ filters, onFilterChange }) {
  const [ageMax, setAgeMax] = useState(MAX_AGE)
  const [ageMin, setAgeMin] = useState(MIN_AGE)

  useEffect(() => {
    if (filters.ageMax) setAgeMax(Number(filters.ageMax))
    if (filters.ageMin) setAgeMin(Number(filters.ageMin))
  }, [filters.ageMax, filters.ageMin])

  function toPercent(age) {
    return ((MAX_AGE - age) / (MAX_AGE - MIN_AGE)) * 100
  }

  function handleMaxChange(e) {
    const val = Math.max(Number(e.target.value), ageMin + 1)
    setAgeMax(val)
  }

  function handleMinChange(e) {
    const val = Math.min(Number(e.target.value), ageMax - 1)
    setAgeMin(val)
  }

  function handleCommit() {
    onFilterChange({
      ...filters,
      ageMax: ageMax === MAX_AGE && ageMin === MIN_AGE ? '' : String(ageMax),
      ageMin: ageMax === MAX_AGE && ageMin === MIN_AGE ? '' : String(ageMin),
    })
  }

  const leftPercent = toPercent(ageMax)
  const rightPercent = 100 - toPercent(ageMin)

  return (
    <div className="timeline-slider glass">
      {/* Era labels */}
      <div className="timeline-eras">
        {ERAS.map((era) => (
          <div
            key={era.name}
            className="timeline-era-label"
            style={{
              left: `${toPercent(era.start)}%`,
              width: `${toPercent(era.end) - toPercent(era.start)}%`,
            }}
          >
            {era.name}
          </div>
        ))}
      </div>

      {/* Colored bar */}
      <div className="timeline-bar">
        <div className="timeline-bar-bg">
          {ERAS.map((era) => (
            <div
              key={era.name}
              className="timeline-bar-era"
              style={{
                left: `${toPercent(era.start)}%`,
                width: `${toPercent(era.end) - toPercent(era.start)}%`,
                background: era.color,
              }}
            />
          ))}
        </div>
        {/* Selection highlight */}
        <div
          className="timeline-bar-selection"
          style={{
            left: `${leftPercent}%`,
            right: `${rightPercent}%`,
          }}
        />
      </div>

      {/* Dual range inputs */}
      <div className="timeline-inputs">
        <input
          type="range"
          className="timeline-range"
          min={MIN_AGE}
          max={MAX_AGE}
          value={ageMax}
          onChange={handleMaxChange}
          onMouseUp={handleCommit}
          onTouchEnd={handleCommit}
        />
        <input
          type="range"
          className="timeline-range"
          min={MIN_AGE}
          max={MAX_AGE}
          value={ageMin}
          onChange={handleMinChange}
          onMouseUp={handleCommit}
          onTouchEnd={handleCommit}
        />
      </div>

      {/* Age labels */}
      <div className="timeline-labels">
        <span>{MAX_AGE} Ma</span>
        <span>{MIN_AGE} Ma</span>
      </div>
    </div>
  )
}

export default TimelineSlider
```

- [ ] **Step 2: Create TimelineSlider CSS**

Create `src/components/TimelineSlider.css`:

```css
.timeline-slider {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: 90%;
  max-width: 700px;
  padding: 10px 20px 12px;
  border-radius: 12px;
}

.timeline-eras {
  position: relative;
  height: 14px;
  margin-bottom: 4px;
}

.timeline-era-label {
  position: absolute;
  text-align: center;
  font-size: 0.55rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

.timeline-bar {
  position: relative;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  background: rgba(212, 169, 89, 0.05);
}

.timeline-bar-bg {
  position: absolute;
  inset: 0;
}

.timeline-bar-era {
  position: absolute;
  top: 0;
  height: 100%;
  opacity: 0.5;
}

.timeline-bar-selection {
  position: absolute;
  top: -2px;
  bottom: -2px;
  border: 2px solid var(--color-gold);
  border-radius: 4px;
  box-shadow: var(--glow-gold);
  pointer-events: none;
}

.timeline-inputs {
  position: relative;
  height: 20px;
  margin-top: -14px;
}

.timeline-range {
  position: absolute;
  width: 100%;
  height: 20px;
  background: none;
  pointer-events: none;
  -webkit-appearance: none;
  appearance: none;
  outline: none;
}

.timeline-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-gold);
  box-shadow: 0 0 8px rgba(212, 169, 89, 0.5);
  cursor: pointer;
  pointer-events: auto;
  border: 2px solid var(--color-base);
}

.timeline-range::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-gold);
  box-shadow: 0 0 8px rgba(212, 169, 89, 0.5);
  cursor: pointer;
  pointer-events: auto;
  border: 2px solid var(--color-base);
}

.timeline-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.6rem;
  color: var(--color-gold-muted);
  margin-top: 4px;
}
```

- [ ] **Step 3: Add TimelineSlider to App**

Update `src/App.jsx` — add import and render.

Add import:
```jsx
import TimelineSlider from './components/TimelineSlider'
```

Add component after FilterChips, before the filterPanelOpen conditional:
```jsx
<TimelineSlider filters={filters} onFilterChange={setFilters} />
```

- [ ] **Step 4: Verify timeline**

```bash
npm run dev
```

Expected: A colored geological timeline bar appears at the bottom of the screen. Drag the handles to select a time range — a glowing gold selection box highlights the range. Release the handle and the map reloads with fossils from that time period. Era labels (Paleozoic, Mesozoic, Cenozoic) appear above the bar.

- [ ] **Step 5: Commit**

```bash
git add src/components/TimelineSlider.jsx src/components/TimelineSlider.css src/App.jsx
git commit -m "feat: add geological timeline slider with era colors and range selection"
```

---

### Task 13: Favorites with localStorage

**Files:**
- Create: `src/hooks/useFavorites.js`, `src/__tests__/useFavorites.test.js`, `src/components/FavoritesMenu.jsx`, `src/components/FavoritesMenu.css`
- Modify: `src/App.jsx`

> **React concept — Custom hook with side effects:** `useFavorites` combines `useState` with `useEffect` to sync state to `localStorage`. Every time favorites change, the hook writes to localStorage. On initial load, it reads from localStorage. This pattern — state + sync to external storage — is very common in React.

- [ ] **Step 1: Write the favorites hook test**

Create `src/__tests__/useFavorites.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFavorites } from '../hooks/useFavorites'

describe('useFavorites', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with empty favorites', () => {
    const { result } = renderHook(() => useFavorites())
    expect(result.current.favorites).toEqual([])
  })

  it('toggles a favorite on', () => {
    const { result } = renderHook(() => useFavorites())
    act(() => result.current.toggleFavorite('123'))
    expect(result.current.favorites).toEqual(['123'])
    expect(result.current.isFavorite('123')).toBe(true)
  })

  it('toggles a favorite off', () => {
    const { result } = renderHook(() => useFavorites())
    act(() => result.current.toggleFavorite('123'))
    act(() => result.current.toggleFavorite('123'))
    expect(result.current.favorites).toEqual([])
    expect(result.current.isFavorite('123')).toBe(false)
  })

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useFavorites())
    act(() => result.current.toggleFavorite('456'))
    expect(JSON.parse(localStorage.getItem('fossil-tracker-favorites'))).toEqual(['456'])
  })

  it('loads from localStorage on mount', () => {
    localStorage.setItem('fossil-tracker-favorites', JSON.stringify(['789']))
    const { result } = renderHook(() => useFavorites())
    expect(result.current.favorites).toEqual(['789'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/useFavorites.test.js
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the hook**

Create `src/hooks/useFavorites.js`:

```js
import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'fossil-tracker-favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  }, [favorites])

  const toggleFavorite = useCallback((occurrenceNo) => {
    setFavorites((prev) =>
      prev.includes(occurrenceNo)
        ? prev.filter((id) => id !== occurrenceNo)
        : [...prev, occurrenceNo]
    )
  }, [])

  const isFavorite = useCallback(
    (occurrenceNo) => favorites.includes(occurrenceNo),
    [favorites]
  )

  return { favorites, toggleFavorite, isFavorite }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/__tests__/useFavorites.test.js
```

Expected: All PASS.

- [ ] **Step 5: Create FavoritesMenu component**

Create `src/components/FavoritesMenu.jsx`:

```jsx
import { useState } from 'react'
import './FavoritesMenu.css'

function FavoritesMenu({ count, onOpen }) {
  return (
    <button className="favorites-button glass" onClick={onOpen}>
      <span className="favorites-icon">&#9825;</span>
      {count > 0 && <span className="favorites-count">{count}</span>}
    </button>
  )
}

export default FavoritesMenu
```

Create `src/components/FavoritesMenu.css`:

```css
.favorites-button {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1000;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-smooth);
}

.favorites-button:hover {
  background: var(--color-gold-subtle);
}

.favorites-icon {
  font-size: 1.1rem;
  color: var(--color-gold);
}

.favorites-count {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--color-gold);
  color: var(--color-base);
  font-size: 0.6rem;
  font-weight: 700;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

- [ ] **Step 6: Wire useFavorites into App**

Update `src/App.jsx` — replace the temporary favorites state with the hook.

Replace the favorites `useState` and `handleToggleFavorite` with:
```jsx
import { useFavorites } from './hooks/useFavorites'
```

Inside the component:
```jsx
const { favorites, toggleFavorite, isFavorite } = useFavorites()
```

Remove the old `favorites` useState and `handleToggleFavorite` callback.

Update DetailPanel props:
```jsx
<DetailPanel
  fossil={detailFossil}
  onClose={() => setDetailFossil(null)}
  isFavorite={detailFossil ? isFavorite(detailFossil.occurrence_no) : false}
  onToggleFavorite={toggleFavorite}
/>
```

Add FavoritesMenu import and render (after SearchBar):
```jsx
import FavoritesMenu from './components/FavoritesMenu'
```

```jsx
<FavoritesMenu count={favorites.length} onOpen={() => {}} />
```

- [ ] **Step 7: Verify favorites persist**

```bash
npm run dev
```

Expected: Click a fossil → click EXPLORE → click "SAVE" in detail panel. The heart fills in to show "SAVED". Close the detail panel. The heart button in the top right shows a count badge. Refresh the page — click the same fossil again and it should still show as saved.

- [ ] **Step 8: Commit**

```bash
git add src/hooks/useFavorites.js src/__tests__/useFavorites.test.js src/components/FavoritesMenu.jsx src/components/FavoritesMenu.css src/App.jsx
git commit -m "feat: add favorites with localStorage persistence and menu button"
```

---

### Task 14: Polish & Final Integration

**Files:**
- Modify: `src/App.jsx`, `src/App.css`, `src/components/MapView.css`

- [ ] **Step 1: Add the app header/logo**

Update `src/App.jsx` — add a header bar. Add this JSX just inside the `<div className="app">`, before `<MapView>`:

```jsx
<header className="app-header glass">
  <div className="app-logo">
    <div className="app-logo-icon">&#129430;</div>
    <div className="app-logo-text">
      <span className="app-logo-title">FOSSIL TRACKER</span>
      <span className="app-logo-subtitle">Explore Deep Time</span>
    </div>
  </div>
</header>
```

- [ ] **Step 2: Add header CSS**

Append to `src/App.css`:

```css
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 900;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--color-gold-border);
  border-radius: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(13, 11, 8, 0.95) 0%, rgba(13, 11, 8, 0) 100%);
  border: none;
  backdrop-filter: none;
}

.app-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  pointer-events: auto;
}

.app-logo-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, var(--color-gold), #8b6914);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  box-shadow: 0 0 12px rgba(212, 169, 89, 0.3);
}

.app-logo-title {
  display: block;
  color: var(--color-gold);
  font-family: var(--font-display);
  font-size: 0.9rem;
  font-weight: bold;
  letter-spacing: 2px;
}

.app-logo-subtitle {
  display: block;
  color: var(--color-gold-muted);
  font-size: 0.5rem;
  letter-spacing: 4px;
  text-transform: uppercase;
}
```

- [ ] **Step 3: Adjust SearchBar and FilterChips positioning**

Update `src/components/SearchBar.css` — change top position to account for header:

```css
.search-bar {
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: 100%;
  max-width: 420px;
  padding: 0 16px;
}
```

Update `src/components/FilterChips.css` — adjust top:

```css
.filter-chips {
  position: fixed;
  top: 112px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 420px;
  padding: 0 16px;
}
```

Update `src/components/FavoritesMenu.css` — adjust top:

```css
.favorites-button {
  position: fixed;
  top: 68px;
  right: 16px;
  z-index: 1000;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-smooth);
}
```

- [ ] **Step 4: Add Leaflet attribution styling**

Append to `src/components/MapView.css`:

```css
/* Style Leaflet attribution to match theme */
.leaflet-control-attribution {
  background: rgba(13, 11, 8, 0.7) !important;
  color: var(--color-gold-muted) !important;
  font-size: 0.6rem !important;
}

.leaflet-control-attribution a {
  color: var(--color-gold) !important;
}
```

- [ ] **Step 5: Verify the complete app**

```bash
npm run dev
```

Expected: Full cinematic museum experience:
- Dark map fills the screen with vignette edges
- Amber/gold header with dinosaur icon and "FOSSIL TRACKER" title
- Glowing amber cluster markers at world zoom
- Search bar with autocomplete floats below header
- Filter chips show active filters
- Timeline slider at bottom with era colors
- Click a fossil → cinematic popup with "EXPLORE"
- Click EXPLORE → detail panel slides in with full info
- Favorites persist across page refreshes

- [ ] **Step 6: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add app header, polish layout positioning, and style Leaflet attribution"
```

---

## Summary

| Task | What it builds | Key React concepts taught |
|------|---------------|--------------------------|
| 1 | Project scaffold | Project structure, entry points |
| 2 | CSS theme | CSS custom properties |
| 3 | Full-screen map | Components, JSX, imports |
| 4 | PBDB API service | Modules, async/await, fetch |
| 5 | Debounce hook | Custom hooks, useState, useEffect |
| 6 | Map events + data loading | State, props, useEffect, useCallback |
| 7 | Fossil markers | Rendering lists, keys, event handlers |
| 8 | Fossil popup | Conditional rendering, composition |
| 9 | Search bar | Controlled inputs, useRef, debouncing |
| 10 | Detail panel | useEffect for fetching, component lifecycle |
| 11 | Filter panel + chips | Lifting state up, local vs shared state |
| 12 | Timeline slider | Controlled range inputs, derived values |
| 13 | Favorites | Custom hooks with localStorage side effects |
| 14 | Polish | Layout composition, final integration |
