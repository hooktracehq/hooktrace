const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}





export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T | null> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    cache: "no-store",
  });

  if (res.status === 404) {
    return null; // ← KEY CHANGE
  }

  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }

  return res.json();
}





export async function fetchDeliveryTargets() {
  return apiFetch('/delivery-targets')
}

export async function createDeliveryTarget(data: any) {
  return apiFetch('/delivery-targets', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateDeliveryTarget(id: string, data: any) {
  return apiFetch(`/delivery-targets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteDeliveryTarget(id: string) {
  return apiFetch(`/delivery-targets/${id}`, {
    method: 'DELETE',
  })
}

export async function testDeliveryTarget(id: string) {
  return apiFetch(`/delivery-targets/${id}/test`, {
    method: 'POST',
  })
}