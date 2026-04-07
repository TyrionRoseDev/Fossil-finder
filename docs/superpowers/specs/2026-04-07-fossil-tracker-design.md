# Fossil Tracker — Design Spec

An interactive web app that displays fossil discovery locations on a world map. Users explore Earth's paleontological history by clicking markers, filtering by time period and organism type, and saving favorites.

## Tech Stack

- **React** (via Vite) — frontend framework
- **React Leaflet** — interactive map (free, no API key)
- **CartoDB Dark Matter tiles** — dark map tiles via `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png` (free, no API key)
- **Paleobiology Database (PBDB)** — fossil data API (free, no API key, CORS enabled)
- **CSS** — custom styling, no UI framework (cinematic museum theme)
- **localStorage** — favorites persistence (no backend)

## Data Source: Paleobiology Database

**Base URL:** `https://paleobiodb.org/data1.2/`

No authentication required. CC0 license. CORS enabled — direct `fetch()` from React.

### Key Endpoints

| Endpoint | Purpose | Key Params |
|----------|---------|------------|
| `/occs/geosum.json` | Clustered markers (zoomed out) | `level`, `base_name`, `interval` |
| `/occs/list.json` | Individual fossil occurrences | `lngmin/max`, `latmin/max`, `base_name`, `interval`, `show=coords,loc,time,class` |
| `/taxa/auto.json` | Search autocomplete | `name`, `limit` |
| `/taxa/single.json` | Detailed species info | `name`, `show=app,size,ecospace,img` |
| `/intervals/list.json` | Geological time periods | `scale=1` |

All requests use `vocab=pbdb` for human-readable field names.

## Layout

Full-screen map with floating overlays:

- **Search bar** — floats at top center
- **Filter chips** — below search bar, showing active filters
- **Filter panel** — expandable overlay for all filter controls
- **Timeline slider** — floats at bottom of the map
- **Popup** — appears on marker click with quick info
- **Detail panel** — slides in from right on "Explore" click

No sidebar. Maximum immersion — the map is the app.

## Component Architecture

```
App
├── MapView                 Full-screen Leaflet map
│   ├── FossilMarkers       Clustered markers at low zoom, individual at high zoom
│   └── FossilPopup         Quick popup: species, era, location, "Explore" link
├── SearchBar               Floating search with autocomplete (taxa/auto.json)
├── FilterChips             Active filter tags below search
├── FilterPanel             Expandable panel with all filters
│   ├── TaxonFilter         Organism type: dinosaurs, fish, plants, etc.
│   ├── PeriodDropdown       Quick-pick geological periods
│   └── TimelineSlider      Visual time range selector (horizontal bar)
├── DetailPanel             Slide-in panel with full fossil details
└── FavoritesMenu           Saved bookmarks from localStorage
```

### State Management

Shared state at the App level, passed down via props:

- `filters` — active time range, taxon, organism type
- `mapBounds` — current visible bounding box
- `zoomLevel` — determines clustered vs individual markers
- `selectedFossil` — currently selected fossil (popup)
- `detailFossil` — fossil shown in detail panel (fetched separately)
- `favorites` — array of saved occurrence IDs (synced to localStorage)

### Data Flow

1. App loads → map centered on world view
2. At zoom levels 1-5 → fetch clustered data via `/occs/geosum.json`
3. At zoom levels 6+ → fetch individual occurrences via `/occs/list.json` with bounding box
4. When filters change → re-fetch with filter params (`base_name`, `interval`)
5. Click marker → show FossilPopup with data already loaded
6. Click "Explore" in popup → fetch from `/taxa/single.json` → open DetailPanel
7. Click "Save" in detail panel → add occurrence ID to localStorage favorites

API calls are debounced (300ms) during map pan/zoom.

## Visual Design: Cinematic Museum

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Deep black | `#0d0b08` | Background, base |
| Elevated surface | `#1a160e` | Cards, panels, popups |
| Amber gold | `#d4a959` | Primary accent, headings, labels |
| Warm white | `#f0e6d0` | Body text, species names |
| Muted gold | `rgba(212,169,89,0.4)` | Secondary text, subtle labels |

### Typography

- **Headings / species names:** Georgia (serif) — museum gravitas
- **Data labels / UI elements:** System sans-serif — clean readability
- **Letter-spacing** on uppercase labels (2-3px) for exhibit-label feel

### Visual Effects

- **Glowing markers:** Radial gradient + box-shadow with amber glow
- **Glass-morphism overlays:** `backdrop-filter: blur(12px)` on search bar, popups, timeline
- **Vignette:** Radial gradient overlay on map edges
- **Gold accent lines:** `linear-gradient(90deg, transparent, rgba(212,169,89,0.5), transparent)` on popup tops
- **Smooth transitions:** CSS transitions on panel slide-in, popup appear, hover states

### Marker Design

- **Clustered (zoomed out):** Amber circles with count, sized proportionally
- **Individual (zoomed in):** 14px glowing amber dots with radial gradient
- **Favorited:** Distinct glow color or icon to differentiate saved fossils

## Detail Panel

Slides in from right side (bottom on mobile), dimming the map behind it.

### Sections

1. **Header** — era label (uppercase, letter-spaced), species name (large serif), italicized scientific name if different from accepted name
2. **Key facts row** — 3-column grid: Era, Period, Age (in Ma)
3. **Classification** — full taxonomy: Kingdom → Phylum → Order → Family → Genus
4. **Discovery site** — formation name, state/country, coordinates
5. **Ecology tags** — pill-shaped tags: carnivore/herbivore, ground dwelling, actively mobile, etc.
6. **Actions** — Save to favorites button, link to source record on PBDB

## Filtering System

### Search Bar
- Floating at top center of map
- Autocomplete powered by `/taxa/auto.json`
- Returns matching taxon names with occurrence counts
- Selecting a result filters the map to that organism

### Filter Controls
- **Taxon filter:** Checkboxes for major groups (Dinosauria, Mammalia, Plantae, etc.)
- **Period dropdown:** Quick-pick from geological periods (Jurassic, Cretaceous, etc.)
- **Timeline slider:** Horizontal bar representing 4,500 Ma to present
  - Color-coded by era (purple for Precambrian, green for Paleozoic, amber for Mesozoic, etc.)
  - Draggable handles to select a time range
  - Era labels above the bar, Ma values below

### Active Filters
- Shown as removable chips below the search bar
- Each chip shows filter name + close button
- "Add Filter" chip opens the filter panel

## Error Handling

- **Loading:** Skeleton markers with pulsing amber glow
- **Empty results:** Friendly message suggesting wider filters
- **API down:** Error message with retry button
- **No connection:** Offline notice

## Performance

- Zoom 1-5: clustered data only (geosum endpoint)
- Zoom 6+: individual occurrences within visible bounding box
- Cap at 500 markers per API request
- "Zoom in to see more" notice when results exceed cap
- 300ms debounce on map pan/zoom API calls

## Mobile Responsiveness

- Detail panel slides up from bottom instead of right
- Search bar and filters stack vertically
- Timeline slider gets taller touch targets
- Filter panel becomes full-screen overlay

## Favorites (localStorage)

- Saved as array of PBDB occurrence IDs
- Favorites menu accessible from header
- Favorited markers distinguished with different glow/icon
- No backend, no accounts — purely local persistence
