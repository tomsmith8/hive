import { useState, useEffect, useCallback, useRef } from "react";
import { ChatMessage } from "@/lib/chat";

interface SSEMessage {
  type: "connected" | "message" | "ping";
  connectionId?: string;
  taskId?: string;
  payload?: ChatMessage;
}

interface UseSSEConnectionOptions {
  taskId: string | null;
  enabled?: boolean;
  onMessage?: (message: ChatMessage) => void;
  reconnectDelay?: number;
}

interface UseSSEConnectionReturn {
  isConnected: boolean;
  connectionId: string | null;
  connect: (taskId: string) => void;
  disconnect: () => void;
  error: string | null;
}

export function useSSEConnection({
  taskId,
  enabled = true,
  onMessage,
  reconnectDelay = 5000,
}: UseSSEConnectionOptions): UseSSEConnectionReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use refs to avoid circular dependencies
  const eventSourceRef = useRef<EventSource | null>(null);
  const onMessageRef = useRef(onMessage);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  onMessageRef.current = onMessage;

  // Stable disconnect function
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      console.log("Closing SSE connection");
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
      setConnectionId(null);
      setError(null);
    }

    // Clear any pending reconnect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Stable connect function - but we'll avoid using it in useEffect
  const connect = useCallback(
    (targetTaskId: string) => {
      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Clear any pending reconnect
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      console.log("Establishing SSE connection for task:", targetTaskId);
      const newEventSource = new EventSource(
        `/api/chat/response?taskId=${targetTaskId}`
      );

      const handleOpen = () => {
        console.log("SSE connection established for task:", targetTaskId);
        setIsConnected(true);
        setError(null);
      };

      const handleMessage = (event: MessageEvent) => {
        try {
          const data: SSEMessage = JSON.parse(event.data);

          switch (data.type) {
            case "connected":
              console.log("SSE connected:", data.connectionId);
              setConnectionId(data.connectionId || null);
              break;

            case "message":
              console.log("Received SSE message:", data.payload);
              if (data.payload && onMessageRef.current) {
                onMessageRef.current(data.payload);
              }
              break;

            case "ping":
              // Keep-alive ping, no action needed
              break;

            default:
              console.log("Unknown SSE message type:", data.type);
          }
        } catch (parseError) {
          console.error("Error parsing SSE message:", parseError);
          setError("Failed to parse SSE message");
        }
      };

      const handleError = () => {
        console.error("SSE connection error");
        setIsConnected(false);
        setError("SSE connection error");

        // Attempt to reconnect after a delay
        reconnectTimeoutRef.current = setTimeout(() => {
          if (targetTaskId) {
            connect(targetTaskId);
          }
        }, reconnectDelay);
      };

      newEventSource.onopen = handleOpen;
      newEventSource.onmessage = handleMessage;
      newEventSource.onerror = handleError;

      eventSourceRef.current = newEventSource;
    },
    [reconnectDelay]
  );

  // Connection management effect - avoid circular dependencies
  useEffect(() => {
    if (!taskId || !enabled) {
      disconnect();
      return;
    }

    // Only connect if we don't already have a connection for this task
    if (!eventSourceRef.current) {
      connect(taskId);
    }

    return disconnect;
  }, [taskId, enabled]); // Removed connect/disconnect from deps

  return {
    isConnected,
    connectionId,
    connect,
    disconnect,
    error,
  };
}
