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
