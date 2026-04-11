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

  const toggleFavorite = useCallback((fossil) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.occurrence_no === fossil.occurrence_no)
      if (exists) {
        return prev.filter((f) => f.occurrence_no !== fossil.occurrence_no)
      }
      // Store a minimal subset of the fossil data
      return [...prev, {
        occurrence_no: fossil.occurrence_no,
        accepted_name: fossil.accepted_name || fossil.identified_name || 'Unknown',
        early_interval: fossil.early_interval || '',
        max_ma: fossil.max_ma || '',
        min_ma: fossil.min_ma || '',
        lat: fossil.lat,
        lng: fossil.lng,
        phylum: fossil.phylum || '',
        class: fossil.class || '',
      }]
    })
  }, [])

  const isFavorite = useCallback(
    (occurrenceNo) => favorites.some((f) => f.occurrence_no === occurrenceNo),
    [favorites]
  )

  return { favorites, toggleFavorite, isFavorite }
}
