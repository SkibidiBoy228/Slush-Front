
import { useCallback, useEffect, useRef, useState } from "react";
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

  const requestIdRef = useRef(0);
  const friendIdRef = useRef(friendId);
  const messagesRef = useRef<ChatMessage[]>([]);

  friendIdRef.current = friendId;

  const updateMessages = useCallback(
    (updater: (current: ChatMessage[]) => ChatMessage[]) => {
      setMessages((current) => {
        const updated = updater(current);
        messagesRef.current = updated;
        return updated;
      });
    },
    [],
  );

  const loadMessages = useCallback(async () => {
    const currentFriendId = friendId;

    const requestId = ++requestIdRef.current;

    if (!currentFriendId) {
      updateMessages(() => []);
      setPage(1);
      setTotalCount(0);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getChatMessages(
        currentFriendId,
        1,
        PAGE_SIZE,
      );

      if (
        requestId !== requestIdRef.current ||
        friendIdRef.current !== currentFriendId
      ) {
        return;
      }

      updateMessages(() => result.items);
      setPage(result.page);
      setTotalCount(result.totalCount);

      window.dispatchEvent(
        new CustomEvent("slush:chat-read", {
          detail: { friendId: currentFriendId },
        }),
      );
    } catch (err) {
      if (
        requestId !== requestIdRef.current ||
        friendIdRef.current !== currentFriendId
      ) {
        return;
      }

      console.error("Failed to load chat messages:", err);
      setError("Не вдалося завантажити повідомлення.");
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [friendId, updateMessages]);

  useEffect(() => {
    updateMessages(() => []);
    setPage(1);
    setTotalCount(0);

    void loadMessages();

    return () => {
      requestIdRef.current += 1;
    };
  }, [friendId, loadMessages, updateMessages]);

  const sendMessage = useCallback(
    async (request: SendChatMessageRequest) => {
      if (!friendId || isSending) return null;

      const currentFriendId = friendId;

      setIsSending(true);
      setError(null);

      try {
        const sentMessage = await sendChatMessage(
          currentFriendId,
          request,
        );

        if (friendIdRef.current !== currentFriendId) {
          return sentMessage;
        }

        updateMessages((current) => {
          if (current.some((message) => message.id === sentMessage.id)) {
            return current;
          }

          return [...current, sentMessage];
        });

        setTotalCount((count) =>
          messagesRef.current.some(
            (message) => message.id === sentMessage.id,
          )
            ? count
            : count + 1,
        );

        return sentMessage;
      } catch (err) {
        console.error("Failed to send chat message:", err);
        setError("Не вдалося надіслати повідомлення.");
        return null;
      } finally {
        if (friendIdRef.current === currentFriendId) {
          setIsSending(false);
        }
      }
    },
    [friendId, isSending, updateMessages],
  );

  const addIncomingMessage = useCallback(
    (message: ChatMessage) => {
      if (message.senderId !== friendIdRef.current) return;

      let wasAdded = false;

      updateMessages((current) => {
        if (current.some((item) => item.id === message.id)) {
          return current;
        }

        wasAdded = true;
        return [...current, message];
      });

      if (wasAdded) {
        setTotalCount((count) => count + 1);
      }
    },
    [updateMessages],
  );

  const loadOlderMessages = useCallback(async () => {
    const currentFriendId = friendId;

    if (
      !currentFriendId ||
      isLoading ||
      messages.length >= totalCount
    ) {
      return;
    }

    const requestId = requestIdRef.current;
    const nextPage = page + 1;

    setIsLoading(true);
    setError(null);

    try {
      const result = await getChatMessages(
        currentFriendId,
        nextPage,
        PAGE_SIZE,
      );

      if (
        requestId !== requestIdRef.current ||
        friendIdRef.current !== currentFriendId
      ) {
        return;
      }

      updateMessages((current) => {
        const existingIds = new Set(
          current.map((message) => message.id),
        );

        const olderMessages = result.items.filter(
          (message) => !existingIds.has(message.id),
        );

        return [...olderMessages, ...current];
      });

      setPage(result.page);
      setTotalCount(result.totalCount);
    } catch (err) {
      if (
        requestId !== requestIdRef.current ||
        friendIdRef.current !== currentFriendId
      ) {
        return;
      }

      console.error("Failed to load older messages:", err);
      setError("Не вдалося завантажити старі повідомленняво пе.");
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [
    friendId,
    isLoading,
    messages.length,
    page,
    totalCount,
    updateMessages,
  ]);

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
