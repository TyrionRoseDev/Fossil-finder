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
