
import { useCallback, useEffect, useRef, useState } from "react";
import { getChatConversations } from "../api/chat";
import type { ChatConversation } from "../types/chat";

export function useChatConversations() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchRef = useRef("");
  const requestIdRef = useRef(0);

  const loadConversations = useCallback(async (search?: string) => {
    if (search !== undefined) {
      searchRef.current = search;
    }

    const currentSearch = searchRef.current;
    const requestId = ++requestIdRef.current;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getChatConversations(currentSearch);

      if (requestId !== requestIdRef.current) return;

      setConversations(data);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;

      console.error("Failed to load chat conversations:", err);
      setError("Не вдалося завантажити список діалогів.");
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadConversations();

    const handleChatMessage = () => {
      void loadConversations();
    };

    const handleChatRead = () => {
      void loadConversations();
    };

    window.addEventListener("slush:chat-message", handleChatMessage);
    window.addEventListener("slush:chat-read", handleChatRead);

    return () => {
      requestIdRef.current += 1;

      window.removeEventListener("slush:chat-message", handleChatMessage);
      window.removeEventListener("slush:chat-read", handleChatRead);
    };
  }, [loadConversations]);

  const updateConversation = useCallback(
    (friendId: string, update: Partial<ChatConversation>) => {
      setConversations((current) =>
        current.map((conversation) =>
          conversation.friendId === friendId
            ? { ...conversation, ...update }
            : conversation,
        ),
      );
    },
    [],
  );

  return {
    conversations,
    setConversations,
    isLoading,
    error,
    loadConversations,
    updateConversation,
  };
}
