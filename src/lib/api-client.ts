export class HttpError extends Error {
  readonly status: number

  constructor(status: number, message = `HTTP error! status: ${status}`) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

export default async function api<T>(
  url: string,
  options?: RequestInit,
): Promise<T | null> {
  const response = await fetch(url, options)

  if (!response.ok) {
    throw new HttpError(response.status)
  }

  const text = await response.text()
  return text ? (JSON.parse(text) as T) : null
}
