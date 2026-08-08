"use client";

import { useQuery } from "@tanstack/react-query";

export type ReplayJob = {
  id: string;
  provider: string | null;
  event_type: string | null;
  status: string;
  attempts: number;
  total_events: number;
  completed_events: number;
  failed_events: number;
  created_at: string;
};

async function fetchReplayJobs(): Promise<ReplayJob[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/replays`,
    {
      credentials: "include",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to load replay jobs");
  }

  return res.json();
}

export function useReplayJobs() {
  return useQuery({
    queryKey: ["replays"],
    queryFn: fetchReplayJobs,
    refetchInterval: 3000,
  });
}