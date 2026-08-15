import { cookies } from "next/headers"

export type User = {
  id: string
  email: string
  avatar_url?: string | null
  name?: string | null
  provider?: string | null
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001"

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()

    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ")

    const response = await fetch(
      `${API_URL}/auth/me`,
      {
        headers: {
          Cookie: cookieHeader,
        },
        cache: "no-store",
      }
    )

    if (!response.ok) {
      return null
    }

    return (await response.json()) as User
  } catch (error) {
    console.error(
      "Failed to get current user:",
      error
    )

    return null
  }
}