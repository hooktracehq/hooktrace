// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// if (!API_URL) {
//   throw new Error("NEXT_PUBLIC_API_URL is not defined");
// }





// export async function apiFetch<T>(
//   path: string,
//   options?: RequestInit
// ): Promise<T | null> {

//   const res = await fetch(`${API_URL}${path}`, {
//     ...options,
//     headers: {
//       "Content-Type": "application/json",
//       ...(options?.headers || {}),
//     },
//     cache: "no-store",
//     credentials: "include",   // ⭐ important
//   })

//   const text = await res.text()

//   if (res.status === 404) return null

//   if (!res.ok) {
//     throw new Error(`API error ${res.status}`)
//   }

//   return JSON.parse(text)
// }




// export async function fetchDeliveryTargets() {
//   return apiFetch('/delivery-targets')
// }

// export async function createDeliveryTarget(data: unknown) {
//   return apiFetch('/delivery-targets', {
//     method: 'POST',
//     body: JSON.stringify(data),
//   })
// }

// export async function updateDeliveryTarget(id: string, data: unknown) {
//   return apiFetch(`/delivery-targets/${id}`, {
//     method: 'PATCH',
//     body: JSON.stringify(data),
//   })
// }

// export async function deleteDeliveryTarget(id: string) {
//   return apiFetch(`/delivery-targets/${id}`, {
//     method: 'DELETE',
//   })
// }

// export async function testDeliveryTarget(id: string) {
//   return apiFetch(`/delivery-targets/${id}/test`, {
//     method: 'POST',
//   })
// }






import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T | null> {

  const cookieStore = await cookies()
  const accessToken = cookieStore.get("access_token")?.value

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Cookie: `access_token=${accessToken}` } : {}),
      ...(options?.headers || {}),
    },
    cache: "no-store",
  })

  const text = await res.text()

  if (res.status === 404) return null

  if (!res.ok) {
    throw new Error(`API ${res.status}: ${text}`)
  }

  return JSON.parse(text)
}