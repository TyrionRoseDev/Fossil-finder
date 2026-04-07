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
