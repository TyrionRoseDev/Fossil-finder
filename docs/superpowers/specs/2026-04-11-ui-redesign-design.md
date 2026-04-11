# Fossil Tracker UI Redesign — Google Earth-Inspired

**Date:** 2026-04-11
**Goal:** Shift the Fossil Tracker UI from the current dark "museum" gold theme to a clean, polished, professional look inspired by Google Earth.

## Direction

Keep the dark CartoDB map tiles. Redesign all UI overlay elements (panels, search, timeline, markers, popups) to feel like a modern, professional product — clean whites/light grays for panels, subtle shadows instead of glows, a cooler accent color, consistent spacing, and generous whitespace.

## Color Palette

Replace the warm gold/brown museum palette with a clean, modern one:

| Variable | Old | New | Purpose |
|----------|-----|-----|---------|
| `--color-base` | `#0d0b08` (dark brown) | `#1a1a2e` (deep navy) | Page/map background |
| `--color-surface` | `#1a160e` (brown) | `#ffffff` (white) | Panel backgrounds |
| `--color-accent` | `#d4a959` (gold) | `#4285f4` (Google blue) | Primary accent |
| `--color-accent-muted` | gold @ 40% | `rgba(66, 133, 244, 0.15)` | Hover states |
| `--color-text` | `#f0e6d0` (cream) | `#202124` (near-black) | Text on light panels |
| `--color-text-secondary` | gold @ 50% | `#5f6368` (gray) | Secondary text |
| `--color-text-on-dark` | — | `#e8eaed` (light gray) | Text on dark/map bg |
| `--color-border` | gold @ 20% | `rgba(0, 0, 0, 0.08)` | Panel borders |
| `--color-shadow` | gold glow | `rgba(0, 0, 0, 0.15)` | Drop shadows |

## Typography

- **Display/headings:** Keep serif (Georgia) for fossil names — adds character
- **Body/UI:** System sans-serif stack (already in place)
- **Labels:** Uppercase tracking stays, but in `--color-text-secondary` gray

## Panel Design (SearchBar, DetailPanel, FilterPanel, ResultsPanel)

**Before:** Dark glass panels (`rgba(13,11,8,0.95)`) with gold borders and glow effects
**After:** Clean white panels with subtle shadow, no glow

- Background: `#ffffff`
- Border: none (use shadow instead)
- Border-radius: `12px` (softer than current `24px` on search)
- Shadow: `0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)`
- Elevated shadow (modals): `0 4px 16px rgba(0,0,0,0.2)`
- Text: dark (`#202124`) on white background
- Accent color for interactive elements, links, active states

## Header

- Remove the ornate logo styling and gold glow
- Clean white text on transparent dark background, or a subtle white bar
- Keep the fossil emoji + "FOSSIL TRACKER" but lighter weight

## Search Bar

- White background, subtle border/shadow
- Dark placeholder text
- Results dropdown: white with hover highlight in accent blue
- Border-radius: `24px` (pill shape, like Google Earth)

## Map Markers

**GeoSum circles (zoom <= 5):**
- Shift from gold to accent blue
- `fillColor: '#4285f4'`
- Slightly more opaque for visibility on dark map

**Individual markers (zoom > 5):**
- Blue dots instead of gold
- Cluster circles: blue with white count text

## Timeline Slider

- White/light panel at bottom instead of dark glass
- Era colors can stay (Paleozoic green, Mesozoic gold, Cenozoic tan) — they're informational
- Slider thumbs: accent blue instead of gold with glow

## Detail Panel

- White background, dark text
- Blue accent for era label and action buttons
- Clean dividers (`1px solid rgba(0,0,0,0.08)`) instead of gold borders
- Taxonomy table: alternating subtle gray rows
- Tags: light blue background instead of gold subtle

## Popups

- White background with subtle shadow
- Blue accent line at top instead of gold gradient
- Dark text, blue "Explore" button

## Vignette

- Remove entirely or make nearly invisible — contributes to the muddy feel

## Favorites & Filter Chips

- White/light chip backgrounds with blue text/icons
- Filter chips: light blue bg with dark text, blue close button

## What Stays the Same

- Layout structure and positioning of all elements
- Responsive breakpoints
- Animation timings (0.3s ease)
- Serif font for fossil names
- Component architecture — this is a CSS-only redesign
- Map tiles (CartoDB dark)

## Implementation Approach

Since all components use CSS custom properties, most of the redesign can be done by:
1. Updating the root variables in `App.css`
2. Updating component-specific styles that hardcode colors
3. Adjusting shadows/borders to replace glow effects
4. Updating marker colors in `FossilMarkers.jsx` (inline styles)
