import { useEffect, useRef, useState } from "react";
import type { Event } from "@/types/event";

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected";

const MAX_EVENTS = 1000;

export function useWebhookStream(path: string) {
  const [events, setEvents] = useState<Event[]>([]);
  const [status, setStatus] =
    useState<ConnectionStatus>("connecting");

  const [reconnectAttempts, setReconnectAttempts] =
    useState(0);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const bufferedRef = useRef(0);

  useEffect(() => {
    let mounted = true;

    function connect(attempt = 0) {
      if (!mounted) return;

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
        if (!mounted) return;

        setReconnectAttempts(0);
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
            const copy = [...previous];
            copy[index] = data;
            return copy;
          }

          return [data, ...previous].slice(
            0,
            MAX_EVENTS
          );
        });
      };

      socket.onerror = () => {
        socket.close();
      };

      socket.onclose = () => {
        if (!mounted) return;

        setStatus("disconnected");

        const nextAttempt = attempt + 1;

        setReconnectAttempts(nextAttempt);

        const delay = Math.min(
          1000 * Math.pow(2, nextAttempt),
          30000
        );

        reconnectTimer.current = setTimeout(() => {
          connect(nextAttempt);
        }, delay);
      };
    }

    connect();

    return () => {
      mounted = false;

      reconnectTimer.current &&
        clearTimeout(reconnectTimer.current);

      socketRef.current?.close();
    };
  }, [path]);

  return {
    events,
    status,
    connected: status === "connected",
    // eslint-disable-next-line react-hooks/refs
    buffered: bufferedRef.current,
    reconnectAttempts,
  };
}