
import { useCallback, useEffect, useState } from "react";
import { getChatAttachments } from "../api/chat";
import type {
  ChatAttachmentMonthGroup,
  ChatMessageType,
} from "../types/chat";

export type ChatAttachmentType = Exclude<ChatMessageType, "Text">;

export function useChatAttachments(
  friendId: string | null,
  type: ChatAttachmentType,
) {
  const [groups, setGroups] = useState<ChatAttachmentMonthGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAttachments = useCallback(async () => {
    if (!friendId) {
      setGroups([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getChatAttachments(friendId, type);
      setGroups(result);
    } catch (err) {
      console.error("Failed to load chat attachments:", err);
      setError("Не удалось загрузить вложения.");
    } finally {
      setIsLoading(false);
    }
  }, [friendId, type]);

  useEffect(() => {
    void loadAttachments();
  }, [loadAttachments]);

  return {
    groups,
    isLoading,
    error,
    loadAttachments,
  };
}
