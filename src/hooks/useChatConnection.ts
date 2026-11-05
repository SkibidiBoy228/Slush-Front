import { useEffect, useRef } from "react";
import { useSignalR } from "../context/SignalRContext";
import type { ReceiveChatMessagePayload } from "../types/chat";

interface UseChatConnectionOptions {
  onMessage: (payload: ReceiveChatMessagePayload) => void;
}

export function useChatConnection({ onMessage }: UseChatConnectionOptions) {
  const { connection, isConnected, connectionError } = useSignalR();

  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!connection) return;

    const handler = (payload: ReceiveChatMessagePayload) => {
      onMessageRef.current(payload);
    };

    connection.on("ReceiveChatMessage", handler);

    return () => {
      connection.off("ReceiveChatMessage", handler);
    };
  }, [connection]);

  return {
    isConnected,
    connectionError,
  };
}