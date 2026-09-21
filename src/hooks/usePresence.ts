import { useEffect } from "react";
import { getAccessToken } from "../api/client";
import { sendHeartbeat } from "../api/presence";

export function usePresence() {
  useEffect(() => {
    const updatePresence = async () => {
      const token = getAccessToken();

      if (!token) return;

      try {
        await sendHeartbeat();
      } catch (error) {
        console.error("Ошибка обновления статуса:", error);
      }
    };

    updatePresence();

    const interval = window.setInterval(updatePresence, 30_000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);
}