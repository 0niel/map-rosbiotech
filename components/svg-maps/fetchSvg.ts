export const fetchSvg = async (url: string) => {
  const parser = new DOMParser()
  const response = await fetch(url)
  const text = await response.text()
  const doc = parser.parseFromString(text, 'image/svg+xml')
  const svg = doc.querySelector('svg')

  return svg?.outerHTML ?? null
}
