
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from "@microsoft/signalr";
import { getAccessToken } from "../api/client";
import type { FriendPresenceToast } from "../types/friendPresence";

interface SignalRContextValue {
  connection: HubConnection | null;
  isConnected: boolean;
  connectionError: string | null;
  friendPresenceEvents: FriendPresenceToast[];
  clearFriendPresenceEvent: (timestamp: string) => void;
}

const SignalRContext = createContext<SignalRContextValue | null>(null);

interface SignalRProviderProps {
  children: ReactNode;
}

export function SignalRProvider({ children }: SignalRProviderProps) {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [friendPresenceEvents, setFriendPresenceEvents] = useState<
    FriendPresenceToast[]
  >([]);

  useEffect(() => {
    let active = true;
    let currentConnection: HubConnection | null = null;
    let queue = Promise.resolve();

    const reconcileConnection = async () => {
      if (!active) return;

      const token = getAccessToken();

      // Пользователь вышел из аккаунта.
      if (!token) {
        if (currentConnection) {
          const oldConnection = currentConnection;
          currentConnection = null;

          await oldConnection.stop();
        }

        if (active) {
          setConnection(null);
          setIsConnected(false);
          setConnectionError(null);
        }

        return;
      }

      // Подключение уже существует.
      if (
        currentConnection &&
        currentConnection.state !== HubConnectionState.Disconnected
      ) {
        return;
      }

      const baseUrl = String(import.meta.env.VITE_API_URL).replace(/\/+$/, "");
      const hubUrl = `${baseUrl}/hubs/chat`;

      const newConnection = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => getAccessToken() ?? "",
        })
        .withAutomaticReconnect()
        .build();

      currentConnection = newConnection;
      setConnection(newConnection);
      setConnectionError(null);

      newConnection.on(
        "FriendPresenceChanged",
        (payload: FriendPresenceToast) => {
          if (!active) return;

          setFriendPresenceEvents((previous) => [
            ...previous,
            payload,
          ]);
        }
      );

      newConnection.onreconnecting(() => {
        if (!active) return;

        setIsConnected(false);
      });

      newConnection.onreconnected(() => {
        if (!active) return;

        setIsConnected(true);
        setConnectionError(null);
      });

      newConnection.onclose((error) => {
        if (!active) return;

        if (currentConnection === newConnection) {
          currentConnection = null;
          setConnection(null);
        }

        setIsConnected(false);

        if (error) {
          setConnectionError("Соединение с сервером потеряно.");
        }
      });

      try {
        await newConnection.start();

        // Пока подключались, пользователь мог выйти.
        if (!active || !getAccessToken()) {
          if (currentConnection === newConnection) {
            currentConnection = null;
          }

          await newConnection.stop();

          if (active) {
            setConnection(null);
            setIsConnected(false);
          }

          return;
        }

        setIsConnected(true);
        setConnectionError(null);
      } catch (error) {
        console.error("SignalR connection failed:", error);

        if (currentConnection === newConnection) {
          currentConnection = null;
        }

        if (!active) return;

        setConnection(null);
        setIsConnected(false);
        setConnectionError("Не удалось подключиться к серверу.");

        await newConnection.stop();
      }
    };

    const scheduleConnectionUpdate = () => {
      queue = queue
        .then(reconcileConnection)
        .catch((error) => {
          console.error("SignalR update failed:", error);
        });
    };

    scheduleConnectionUpdate();

    const handleAuthChanged = () => {
      scheduleConnectionUpdate();
    };

    window.addEventListener("auth-changed", handleAuthChanged);

    return () => {
      active = false;

      window.removeEventListener("auth-changed", handleAuthChanged);

      if (currentConnection) {
        const oldConnection = currentConnection;
        currentConnection = null;

        void oldConnection.stop();
      }
    };
  }, []);

  const clearFriendPresenceEvent = (timestamp: string) => {
    setFriendPresenceEvents((previous) =>
      previous.filter((event) => event.timestamp !== timestamp)
    );
  };

  return (
    <SignalRContext.Provider
      value={{
        connection,
        isConnected,
        connectionError,
        friendPresenceEvents,
        clearFriendPresenceEvent,
      }}
    >
      {children}
    </SignalRContext.Provider>
  );
}

export function useSignalR() {
  const context = useContext(SignalRContext);

  if (!context) {
    throw new Error("useSignalR must be used inside SignalRProvider");
  }

  return context;
}
