const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001"

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type":
          "application/json",
        ...(options?.headers ?? {}),
      },
      cache: "no-store",
    }
  )

  const text = await res.text()

  if (!res.ok) {
    throw new Error(
      `API ${res.status}: ${text}`
    )
  }

  // Handles 204 No Content responses
  if (!text) {
    return {} as T
  }

  return JSON.parse(text) as T
}