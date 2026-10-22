
export type ChatMessageType = "Text" | "Image" | "File" | "Voice";

export interface ChatConversation {
  friendId: string;
  username: string;
  avatarUrl: string;
  isOnline: boolean;
  lastSeenAt: string | null;
  lastMessagePreview: string;
  lastMessageAt: string | null;
  lastMessageDateFormatted: string | null;
  unreadCount: number;
  notificationsEnabled: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderUsername: string;
  senderAvatarUrl: string;
  receiverId: string;
  isMine: boolean;
  messageType: ChatMessageType;
  content: string | null;
  mediaUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  formattedFileSize: string | null;
  durationSeconds: number | null;
  formattedDuration: string | null;
  isRead: boolean;
  createdAt: string;
  timeFormatted: string;
  dateFormatted: string;
}
export interface SendChatMessageRequest {
  messageType: ChatMessageType;
  content?: string | null;
  mediaUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  durationSeconds?: number | null;
}
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
export interface ChatAttachmentItem {
  messageId: string;
  senderId: string;
  senderUsername: string;
  messageType: ChatMessageType;
  mediaUrl: string;

  fileName: string | null;
  fileSize: number | null;
  formattedFileSize: string | null;

  durationSeconds: number | null;
  formattedDuration: string | null;

  createdAt: string;
  formattedDateTime: string;
}
export interface ChatAttachmentMonthGroup {
  year: number;
  month: number;
  monthTitle: string;
  items: ChatAttachmentItem[];
}
export interface ChatMediaUploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  formattedFileSize: string;
  durationSeconds: number | null;
}
export interface ToggleChatNotificationsRequest {
  notificationsEnabled: boolean;
}
export interface ToggleChatNotificationsResponse {
  friendId: string;
  notificationsEnabled: boolean;
}
export interface ReceiveChatMessagePayload {
  message: ChatMessage;
  shouldNotify: boolean;
}
