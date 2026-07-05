import { apiFetch } from "@/lib/api"

import type {
  AggregationRule,
  AggregationResponse,
  CreateAggregationRequest,
  UpdateAggregationRequest,
} from "@/types/aggregation"

export async function getAggregationRules() {
  return apiFetch<AggregationResponse>(
    "/aggregation"
  )
}

export async function getAggregationRule(
  id: string
) {
  return apiFetch<AggregationRule>(
    `/aggregation/${id}`
  )
}



export async function createAggregationRule(
  data: CreateAggregationRequest
) {
  console.log("createAggregationRule")
  console.log("before apiFetch")

  const result = await apiFetch<AggregationRule>(
    "/aggregation",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  )

  console.log("after apiFetch")

  return result
}
// export async function createAggregationRule(
//   data: CreateAggregationRequest
// ) {
//   console.log("5. createAggregationRule")

//   return apiFetch<AggregationRule>(
//     "/aggregation",
//     {
//       method: "POST",
//       body: JSON.stringify(data),
//     }
//   )
// }

export async function updateAggregationRule(
  id: string,
  data: UpdateAggregationRequest
) {
  return apiFetch<AggregationRule>(
    `/aggregation/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  )
}

export async function deleteAggregationRule(
  id: string
) {
  return apiFetch(
    `/aggregation/${id}`,
    {
      method: "DELETE",
    }
  )
}