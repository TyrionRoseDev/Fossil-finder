import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildUrl, parseOccurrences, parseClusters } from '../api/pbdb'

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
