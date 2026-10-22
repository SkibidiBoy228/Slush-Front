
import { useCallback, useEffect, useState } from "react";
import {
  getChatMessages,
  sendChatMessage,
} from "../api/chat";
import type {
  ChatMessage,
  SendChatMessageRequest,
} from "../types/chat";

const PAGE_SIZE = 50;

export function useChatMessages(friendId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const loadMessages = useCallback(async () => {
    if (!friendId) {
      setMessages([]);
      setPage(1);
      setTotalCount(0);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await getChatMessages(friendId, 1, PAGE_SIZE);
      setMessages(result.items);
      setPage(result.page);
      setTotalCount(result.totalCount);
    } catch (err) {
      console.error("Failed to load chat messages:", err);
      setError("Не удалось загрузить сообщения.");
    } finally {
      setIsLoading(false);
    }
  }, [friendId]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);
  const sendMessage = useCallback(
    async (request: SendChatMessageRequest) => {
      if (!friendId || isSending) return null;
      setIsSending(true);
      setError(null);
      try {
        const sentMessage = await sendChatMessage(friendId, request);
        setMessages((current) => {
          if (current.some((message) => message.id === sentMessage.id)) {
            return current;
          }
          return [...current, sentMessage];
        });
        setTotalCount((count) => count + 1);
        return sentMessage;
      } catch (err) {
        console.error("Failed to send chat message:", err);
        setError("Не удалось отправить сообщение.");
        return null;
      } finally {
        setIsSending(false);
      }
    },
    [friendId, isSending],
  );
  const addIncomingMessage = useCallback((message: ChatMessage) => {
    setMessages((current) => {
      if (current.some((item) => item.id === message.id)) {
        return current;
      }

      return [...current, message];
    });

    setTotalCount((count) => count + 1);
  }, []);
  const loadOlderMessages = useCallback(async () => {
    if (!friendId || isLoading || messages.length >= totalCount) return;
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const result = await getChatMessages(friendId, nextPage, PAGE_SIZE);

      setMessages((current) => {
        const existingIds = new Set(current.map((message) => message.id));
        const olderMessages = result.items.filter(
          (message) => !existingIds.has(message.id),
        );

        return [...olderMessages, ...current];
      });

      setPage(result.page);
    } catch (err) {
      console.error("Failed to load older messages:", err);
      setError("Не удалось загрузить предыдущие сообщения.");
    } finally {
      setIsLoading(false);
    }
  }, [friendId, isLoading, messages.length, page, totalCount]);
  return {
    messages,
    setMessages,
    isLoading,
    isSending,
    error,
    page,
    totalCount,
    hasOlderMessages: messages.length < totalCount,
    loadMessages,
    sendMessage,
    addIncomingMessage,
    loadOlderMessages,
  };
}
