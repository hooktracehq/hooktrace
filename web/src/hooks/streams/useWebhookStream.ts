import { useEffect, useRef, useState } from "react";

import type { Event } from "@/types/event";

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected";

export function useWebhookStream(path: string) {
  const [events, setEvents] = useState<Event[]>([]);
  const [status, setStatus] =
    useState<ConnectionStatus>("connecting");

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<NodeJS.Timeout | null>(null);
  const bufferedRef = useRef(0);

  useEffect(() => {
    let mounted = true;

    function connect() {
      setStatus("connecting");

      const protocol =
        window.location.protocol === "https:"
          ? "wss"
          : "ws";

      const socket = new WebSocket(
        `${protocol}://${window.location.hostname}:3001${path}`
      );

      socketRef.current = socket;

      socket.onopen = () => {
        console.log("[WS] connected");
        if (!mounted) return;
        setStatus("connected");
      };

      socket.onmessage = (message) => {
        const data: Event = JSON.parse(message.data);

        bufferedRef.current++;

        setEvents((previous) => {
          const index = previous.findIndex(
            (e) => e.id === data.id
          );

          if (index !== -1) {
            const next = [...previous];
            next[index] = data;
            return next;
          }

          return [data, ...previous];
        });
      };

      socket.onerror = (error) => {
        console.error("[WS] error", error);
      };

      socket.onclose = (event) => {
        console.log(
          "[WS] closed",
          event.code,
          event.reason
        );

        if (!mounted) return;

        setStatus("disconnected");

        reconnectRef.current = setTimeout(
          connect,
          2000
        );
      };
    }

    connect();

    return () => {
      mounted = false;

      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
      }

      socketRef.current?.close();
    };
  }, [path]);

  return {
    events,
    status,
    connected: status === "connected",
    // eslint-disable-next-line react-hooks/refs
    buffered: bufferedRef.current,
  };
}