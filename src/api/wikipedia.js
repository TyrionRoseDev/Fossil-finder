const WIKI_SUMMARY_API = 'https://en.wikipedia.org/api/rest_v1/page/summary'
const WIKI_MEDIA_API = 'https://en.wikipedia.org/api/rest_v1/page/media-list'

// Fetch all images from a Wikipedia page and pick the best one
async function fetchBestImage(pageTitle) {
  try {
    const encoded = encodeURIComponent(pageTitle.replace(/ /g, '_'))
    const response = await fetch(`${WIKI_MEDIA_API}/${encoded}`, {
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) return null

    const data = await response.json()
    const items = data.items || []

    // Filter for actual images (not icons, logos, etc.)
    const images = items.filter((item) => {
      if (item.type !== 'image') return false
      const src = (item.srcset?.[0]?.src || item.original?.source || '').toLowerCase()
      // Skip tiny icons, flags, maps, range maps, wiki logos
      if (src.includes('flag_of') || src.includes('wiki') || src.includes('icon')) return false
      if (src.includes('range_map') || src.includes('distribution') || src.includes('map')) return false
      if (src.includes('.svg')) return false
      // Prefer larger images
      const width = item.original?.width || item.srcset?.[0]?.width || 0
      return width > 200
    })

    if (images.length === 0) return null

    // Prefer images with "restoration", "reconstruction", "life", "artist" in the title
    const preferred = images.find((img) => {
      const title = (img.title || '').toLowerCase()
      const caption = (img.caption?.text || '').toLowerCase()
      return (
        title.includes('restor') ||
        title.includes('reconstruct') ||
        title.includes('life') ||
        title.includes('artist') ||
        caption.includes('restor') ||
        caption.includes('reconstruct') ||
        caption.includes('life')
      )
    })

    const best = preferred || images[0]

    // Get the highest resolution source
    const source =
      best.original?.source ||
      best.srcset?.sort((a, b) => (b.scale || 1) - (a.scale || 1))[0]?.src ||
      null

    if (!source) return null

    // Ensure full URL
    return source.startsWith('//') ? `https:${source}` : source
  } catch {
    return null
  }
}

export async function fetchWikipediaSummary(term) {
  // Try the exact term first, then just the genus name
  const attempts = [term]
  const genus = term.split(' ')[0]
  if (genus !== term) attempts.push(genus)

  for (const name of attempts) {
    try {
      const encoded = encodeURIComponent(name.replace(/ /g, '_'))
      const response = await fetch(`${WIKI_SUMMARY_API}/${encoded}`, {
        headers: { Accept: 'application/json' },
      })

      if (!response.ok) continue

      const data = await response.json()

      // Skip disambiguation pages
      if (data.type === 'disambiguation') continue

      // Try to get a better image from the page's media list
      const betterImage = await fetchBestImage(data.title)

      return {
        title: data.title,
        description: data.description || null,
        extract: data.extract || null,
        image:
          betterImage ||
          data.originalimage?.source ||
          data.thumbnail?.source ||
          null,
        pageUrl: data.content_urls?.desktop?.page || null,
      }
    } catch {
      continue
    }
  }

  return null
}
