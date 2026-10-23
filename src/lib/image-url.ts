// Resizes and converts remote images to WebP through the wsrv.nl image proxy.
// fakestore serves 220–320 kB PNGs; a 320px WebP is ~20 kB.
const PROXY_URL = 'https://wsrv.nl/'

export function resizedImageUrl(url: string, width: number) {
  const params = new URLSearchParams({
    url,
    w: String(width),
    output: 'webp',
    we: '', // never upscale past the original size
  })

  return `${PROXY_URL}?${params.toString()}`
}

export function resizedImageSrcSet(url: string, widths: number[]) {
  return widths
    .map((width) => `${resizedImageUrl(url, width)} ${width}w`)
    .join(', ')
}
