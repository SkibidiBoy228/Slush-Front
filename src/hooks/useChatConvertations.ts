
import { useCallback, useEffect, useState } from "react";
import { getChatConversations } from "../api/chat";
import type { ChatConversation } from "../types/chat";

export function useChatConversations() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async (search = "") => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getChatConversations(search);
      setConversations(data);
    } catch (err) {
      console.error("Failed to load chat conversations:", err);
      setError("Не вдалося завантажити список діалогів.");
    } finally {
      setIsLoading(false);
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
