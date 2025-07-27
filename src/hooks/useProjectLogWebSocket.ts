import { useEffect, useRef } from "react";

interface LogEntry {
  timestamp: string;
  projectId: string;
  chatId: string;
  message: string;
}

export const useProjectLogWebSocket = (
  projectId: string | null,
  chatId: string | null,
  isVerboseLoggingEnabled: boolean = false
) => {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!projectId || !chatId) {
      return;
    }

    const connectToLogWebSocket = () => {
      const ws = new WebSocket(
        "wss://jobs.stakwork.com/cable?channel=ProjectLogChannel"
      );

      ws.onopen = () => {
        const command = {
          command: "subscribe",
          identifier: JSON.stringify({
            channel: "ProjectLogChannel",
            id: projectId,
          }),
        };
        ws.send(JSON.stringify(command));
      };

      ws.onmessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.type === "ping") return;

        if (isVerboseLoggingEnabled) {
          console.log("Hive Chat Data message", data);
        }

        const messageData = data?.message;

        if (
          messageData &&
          (messageData.type === "on_step_start" ||
            messageData.type === "on_step_complete")
        ) {
          const logEntry: LogEntry = {
            timestamp: new Date().toISOString(),
            projectId,
            chatId,
            message: messageData.message,
          };
          console.log("Project Log:", logEntry);
        }
      };

      ws.onerror = (error: Event) =>
        console.error("WebSocket error123:", error);

      ws.onclose = () => {
        console.log("WebSocket connection closed");
      };

      return ws;
    };

    wsRef.current = connectToLogWebSocket();

    // Cleanup function
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [projectId, chatId, isVerboseLoggingEnabled]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    disconnect: () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    },
  };
};
