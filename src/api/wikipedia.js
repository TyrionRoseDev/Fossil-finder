const WIKI_API = 'https://en.wikipedia.org/api/rest_v1/page/summary'

export async function fetchWikipediaSummary(term) {
  // Try the exact term first, then just the genus name
  const attempts = [term]
  const genus = term.split(' ')[0]
  if (genus !== term) attempts.push(genus)

  for (const name of attempts) {
    try {
      const encoded = encodeURIComponent(name.replace(/ /g, '_'))
      const response = await fetch(`${WIKI_API}/${encoded}`, {
        headers: { 'Accept': 'application/json' },
      })

      if (!response.ok) continue

      const data = await response.json()

      // Skip disambiguation pages
      if (data.type === 'disambiguation') continue

      return {
        title: data.title,
        description: data.description || null,
        extract: data.extract || null,
        image: data.originalimage?.source || data.thumbnail?.source || null,
        pageUrl: data.content_urls?.desktop?.page || null,
      }
    } catch {
      continue
    }
  }

  return null
}
