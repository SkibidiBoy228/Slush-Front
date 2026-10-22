
import { apiRequest } from "./client";
import type {
  ChatAttachmentMonthGroup,
  ChatConversation,
  ChatMessage,
  PagedResult,
  SendChatMessageRequest,
  ToggleChatNotificationsRequest,
  ToggleChatNotificationsResponse,
} from "../types/chat";
export async function getChatConversations(
  search = "",
): Promise<ChatConversation[]> {
  const query = new URLSearchParams();
  if (search.trim()) {
    query.set("search", search.trim());
  }
  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  return apiRequest<ChatConversation[]>(
    `/api/Chat/conversations${suffix}`,
  );
}
export async function getChatMessages(
  friendId: string,
  page = 1,
  pageSize = 50,
): Promise<PagedResult<ChatMessage>> {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  return apiRequest<PagedResult<ChatMessage>>(
    `/api/Chat/${encodeURIComponent(friendId)}/messages?${query}`,
  );
}
export async function sendChatMessage(
  friendId: string,
  request: SendChatMessageRequest,
): Promise<ChatMessage> {
  return apiRequest<ChatMessage>(
    `/api/Chat/${encodeURIComponent(friendId)}/messages`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    },
  );
}

export async function markChatAsRead(
  friendId: string,
): Promise<{ readCount: number }> {
  return apiRequest<{ readCount: number }>(
    `/api/Chat/${encodeURIComponent(friendId)}/read`,
    { method: "PUT" },
  );
}

export async function getChatAttachments(
  friendId: string,
  type: Exclude<ChatMessage["messageType"], "Text">,
): Promise<ChatAttachmentMonthGroup[]> {
  const query = new URLSearchParams({ type });
  return apiRequest<ChatAttachmentMonthGroup[]>(
    `/api/Chat/${encodeURIComponent(friendId)}/attachments?${query}`,
  );
}
export async function setChatNotifications(
  friendId: string,
  notificationsEnabled: boolean,
): Promise<ToggleChatNotificationsResponse> {
  const request: ToggleChatNotificationsRequest = {
    notificationsEnabled,
  };
  return apiRequest<ToggleChatNotificationsResponse>(
    `/api/Chat/${encodeURIComponent(friendId)}/notifications`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    },
  );
}
