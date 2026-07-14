export const QueryKeys = {
    tunnels: ["tunnels"] as const,
  
    tunnel: (id: string) =>
      ["tunnel", id] as const,
  
    tunnelLogs: (id: string) =>
      ["tunnel-logs", id] as const,
  
    tunnelStats: (id: string) =>
      ["tunnel-stats", id] as const,
  }