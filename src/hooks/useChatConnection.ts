
import { useEffect, useState } from "react";
import {
  HubConnection,
  HubConnectionBuilder,
} from "@microsoft/signalr";
import { getAccessToken } from "../api/client";
import type { ReceiveChatMessagePayload } from "../types/chat";

interface UseChatConnectionOptions {
  onMessage: (payload: ReceiveChatMessagePayload) => void;
}

export function useChatConnection({
  onMessage,
}: UseChatConnectionOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const baseUrl = String(import.meta.env.VITE_API_URL).replace(/\/+$/, "");
    const hubUrl = `${baseUrl}/hubs/chat`;

    const connection: HubConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => getAccessToken() ?? "",
      })
      .withAutomaticReconnect()
      .build();

    connection.on(
      "ReceiveChatMessage",
      (payload: ReceiveChatMessagePayload) => {
        if (active) {
          onMessage(payload);
        }
      },
    );

    connection.onreconnecting(() => {
      if (active) setIsConnected(false);
    });

    connection.onreconnected(() => {
      if (active) {
        setIsConnected(true);
        setConnectionError(null);
      }
    });

    connection.onclose((error) => {
      if (!active) return;

      setIsConnected(false);

      if (error) {
        setConnectionError("Соединение чата потеряно.");
      }
    });

    void connection
      .start()
      .then(() => {
        if (active) {
          setIsConnected(true);
          setConnectionError(null);
        }
      })
      .catch((error: unknown) => {
        console.error("SignalR connection failed:", error);

        if (active) {
          setIsConnected(false);
          setConnectionError("Не удалось подключиться к чату.");
        }
      });

    return () => {
      active = false;
      connection.off("ReceiveChatMessage");
      void connection.stop();
    };
  }, [onMessage]);

  return {
    isConnected,
    connectionError,
  };
}
