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
