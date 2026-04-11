import './FavoritesMenu.css'

function FavoritesMenu({ count }) {
  return (
    <button className="favorites-button glass">
      <span className="favorites-icon">&#9825;</span>
      {count > 0 && <span className="favorites-count">{count}</span>}
    </button>
  )
}

export default FavoritesMenu
