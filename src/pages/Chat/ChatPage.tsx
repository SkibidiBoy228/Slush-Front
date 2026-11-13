
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import ChatSidebar from "../../components/Chat/ChatSidebar";
import ChatWindow from "../../components/Chat/ChatWindow";

import { removeFriend } from "../../api/friends";
import {
  clearChatHistory,
  setChatBlock,
  reportChatUser,
  markChatAsRead,
} from "../../api/chat";

import { useChatMessages } from "../../hooks/useChatMessages";
import { useChatConnection } from "../../hooks/useChatConnection";
import { useChatAttachments } from "../../hooks/useChatAttacments";

import type {
  ChatConversation,
  ChatMessage,
  ReceiveChatMessagePayload,
  SendChatMessageRequest,
} from "../../types/chat";

import "./ChatPage.css";

type ConversationWithBlockStatus = ChatConversation & {
  isBlockedByMe?: boolean;
  hasBlockedMe?: boolean;
};

function getMessagePreview(
  message: ChatMessage,
  t: (key: string) => string
): string {
  switch (message.messageType) {
    case "Image":
      return t("chat.messageImage");
    case "File":
      return `📎 ${message.fileName || t("chat.messageFile")}`;
    case "Voice":
      return t("chat.messageVoice");
    default:
      return message.content || "";
  }
}

export default function ChatPage() {
  const { t } = useTranslation();

  const [selectedConversation, setSelectedConversation] =
    useState<ChatConversation | null>(null);

  const [isBlocked, setIsBlocked] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const {
    messages,
    isLoading,
    isSending,
    sendMessage,
    addIncomingMessage,
    setMessages,
  } = useChatMessages(selectedConversation?.friendId ?? null);

  const friendId = selectedConversation?.friendId ?? null;

  const {
    groups: photoGroups,
    isLoading: photosLoading,
  } = useChatAttachments(friendId, "Image");

  const {
    groups: fileGroups,
    isLoading: filesLoading,
  } = useChatAttachments(friendId, "File");

  const {
    groups: voiceGroups,
    isLoading: voicesLoading,
  } = useChatAttachments(friendId, "Voice");

  const photoCount = photoGroups.reduce(
    (total, group) => total + group.items.length,
    0
  );

  const fileCount = fileGroups.reduce(
    (total, group) => total + group.items.length,
    0
  );

  const voiceCount = voiceGroups.reduce(
    (total, group) => total + group.items.length,
    0
  );

  const attachmentsLoading =
    photosLoading || filesLoading || voicesLoading;

  useEffect(() => {
    const conversation =
      selectedConversation as ConversationWithBlockStatus | null;

    setIsBlocked(Boolean(conversation?.isBlockedByMe));
  }, [selectedConversation]);

  const handleIncomingMessage = useCallback(
    (payload: ReceiveChatMessagePayload) => {
      const message = payload.message;
      const isCurrentConversation =
        selectedConversation?.friendId === message.senderId &&
        !message.isMine;

      if (isCurrentConversation) {
        addIncomingMessage(message);

        void markChatAsRead(message.senderId)
          .then(() => {
            window.dispatchEvent(
              new CustomEvent("slush:chat-read", {
                detail: { friendId: message.senderId },
              })
            );
          })
          .catch((error) => {
            console.error(
              "Failed to mark messages as read:",
              error
            );
          });
      }

      window.dispatchEvent(
        new CustomEvent("slush:chat-message", {
          detail: {
            message,
            shouldNotify: payload.shouldNotify,
            preview: getMessagePreview(message, t),
          },
        })
      );
    },
    [selectedConversation?.friendId, addIncomingMessage, t]
  );

  const { isConnected, connectionError } = useChatConnection({
    onMessage: handleIncomingMessage,
  });

  const handleSendMessage = useCallback(
    async (request: SendChatMessageRequest) => {
      const sentMessage = await sendMessage(request);

      if (!sentMessage) {
        throw new Error(t("chat.sendError"));
      }
    },
    [sendMessage, t]
  );

  const handleSelectConversation = useCallback(
    (conversation: ChatConversation) => {
      setSelectedConversation(conversation);
    },
    []
  );

  const handleRemoveFriend = useCallback(async () => {
    if (!selectedConversation || isActionLoading) {
      return;
    }

    const confirmed = window.confirm(
      t("chat.confirmRemoveFriend", {
        username: selectedConversation.username,
      })
    );

    if (!confirmed) {
      return;
    }

    setIsActionLoading(true);

    try {
      await removeFriend(selectedConversation.friendId);
      setSelectedConversation(null);

      window.dispatchEvent(new CustomEvent("slush:friends-updated"));
    } catch (error) {
      console.error("Failed to remove friend:", error);
      window.alert(t("chat.removeFriendError"));
    } finally {
      setIsActionLoading(false);
    }
  }, [selectedConversation, isActionLoading, t]);

  const handleClearHistory = useCallback(async () => {
    if (!selectedConversation || isActionLoading) {
      return;
    }

    const confirmed = window.confirm(
      t("chat.confirmClearHistory", {
        username: selectedConversation.username,
      })
    );

    if (!confirmed) {
      return;
    }

    setIsActionLoading(true);

    try {
      await clearChatHistory(selectedConversation.friendId);
      setMessages([]);

      window.alert(t("chat.historyCleared"));
    } catch (error) {
      console.error("Failed to clear chat history:", error);
      window.alert(t("chat.clearHistoryError"));
    } finally {
      setIsActionLoading(false);
    }
  }, [selectedConversation, isActionLoading, setMessages, t]);

  const handleToggleBlock = useCallback(async () => {
    if (!selectedConversation || isActionLoading) {
      return;
    }

    const nextBlockedState = !isBlocked;

    const confirmed = window.confirm(
      nextBlockedState
        ? t("chat.confirmBlock", {
            username: selectedConversation.username,
          })
        : t("chat.confirmUnblock", {
            username: selectedConversation.username,
          })
    );

    if (!confirmed) {
      return;
    }

    setIsActionLoading(true);

    try {
      const result = await setChatBlock(
        selectedConversation.friendId,
        nextBlockedState
      );

      setIsBlocked(result.isBlocked);

      setSelectedConversation((current) =>
        current
          ? ({
              ...current,
              isBlockedByMe: result.isBlocked,
            } as ConversationWithBlockStatus)
          : current
      );

      window.alert(
        result.isBlocked
          ? t("chat.userBlocked")
          : t("chat.userUnblocked")
      );

      window.dispatchEvent(new CustomEvent("slush:chat-block-updated"));
    } catch (error) {
      console.error("Failed to update block status:", error);
      window.alert(t("chat.blockError"));
    } finally {
      setIsActionLoading(false);
    }
  }, [selectedConversation, isBlocked, isActionLoading, t]);

  const handleReportUser = useCallback(async () => {
    if (!selectedConversation || isActionLoading) {
      return;
    }

    const reason = window.prompt(
      t("chat.reportReasonPrompt")
    );

    if (reason === null) {
      return;
    }

    // Эти значения сохраняются в исходном формате для backend.
    const reasonOptions: Record<string, string> = {
      "1": "Спам",
      "2": "Образи або переслідування",
      "3": "Неприйнятний контент",
      "4": "Шахрайство",
      "5": "Інше",
    };

    const normalizedReason = reasonOptions[reason.trim()];

    if (!normalizedReason) {
      window.alert(t("chat.invalidReportReason"));
      return;
    }

    const details = window.prompt(
      t("chat.reportDetailsPrompt")
    );

    if (details === null) {
      return;
    }

    setIsActionLoading(true);

    try {
      await reportChatUser(
        selectedConversation.friendId,
        normalizedReason,
        details.trim() || undefined
      );

      window.alert(t("chat.reportSuccess"));
    } catch (error) {
      console.error("Failed to report user:", error);
      window.alert(t("chat.reportError"));
    } finally {
      setIsActionLoading(false);
    }
  }, [selectedConversation, isActionLoading, t]);

  return (
    <div className="chat-page">
      <main className="chat-page__layout">
        <ChatSidebar
          selectedFriendId={selectedConversation?.friendId ?? null}
          onSelectConversation={handleSelectConversation}
        />

        <section className="chat-page__center">
          <div className="chat-page__connection">
            <span
              className={`chat-page__connection-dot ${
                isConnected ? "is-connected" : ""
              }`}
            />

            <span>
              {connectionError ||
                (isConnected
                  ? t("chat.connected")
                  : t("chat.connecting"))}
            </span>
          </div>

          <ChatWindow
            conversation={selectedConversation}
            messages={messages}
            isLoading={isLoading}
            isSending={isSending}
            onSendMessage={handleSendMessage}
          />
        </section>

        {selectedConversation && (
          <ChatProfilePanel
            conversation={selectedConversation}
            photoCount={photoCount}
            fileCount={fileCount}
            voiceCount={voiceCount}
            attachmentsLoading={attachmentsLoading}
            isBlocked={isBlocked}
            isActionLoading={isActionLoading}
            onRemoveFriend={handleRemoveFriend}
            onClearHistory={handleClearHistory}
            onToggleBlock={handleToggleBlock}
            onReportUser={handleReportUser}
          />
        )}
      </main>
    </div>
  );
}

interface ChatProfilePanelProps {
  conversation: ChatConversation | null;
  photoCount: number;
  fileCount: number;
  voiceCount: number;
  attachmentsLoading: boolean;
  isBlocked: boolean;
  isActionLoading: boolean;
  onRemoveFriend: () => void;
  onClearHistory: () => void;
  onToggleBlock: () => void;
  onReportUser: () => void;
}

function ChatProfilePanel({
  conversation,
  photoCount,
  fileCount,
  voiceCount,
  attachmentsLoading,
  isBlocked,
  isActionLoading,
  onRemoveFriend,
  onClearHistory,
  onToggleBlock,
  onReportUser,
}: ChatProfilePanelProps) {
  const { t } = useTranslation();

  if (!conversation) {
    return (
      <aside className="chat-profile chat-profile--empty">
        <p>{t("chat.selectConversation")}</p>
      </aside>
    );
  }

  const profileUrl = `/profile/${encodeURIComponent(
    conversation.username
  )}`;

  const otherUserBlockedMe = Boolean(
    (conversation as ConversationWithBlockStatus).hasBlockedMe
  );

  return (
    <aside className="chat-profile">
      <div className="chat-profile__identity">
        <a
          href={profileUrl}
          className="chat-profile__avatar"
          aria-label={t("chat.openProfile", {
            username: conversation.username,
          })}
        >
          {conversation.avatarUrl ? (
            <img src={conversation.avatarUrl} alt="" />
          ) : (
            <span>{conversation.username.charAt(0).toUpperCase()}</span>
          )}
        </a>

        <a href={profileUrl} className="chat-profile__username">
          {conversation.username}
        </a>

        <span
          className={
            conversation.isOnline
              ? "chat-profile__online is-online"
              : "chat-profile__online"
          }
        >
          {conversation.isOnline
            ? t("chat.online")
            : t("chat.offline")}
        </span>
      </div>

      <div className="chat-profile__setting">
        <span>{t("chat.notifications")}</span>
        <span>
          {conversation.notificationsEnabled
            ? t("chat.enabled")
            : t("chat.disabled")}
        </span>
      </div>

      <div className="chat-profile__section">
        <div className="chat-profile__item">
          <span>▧ {t("chat.photos")}</span>
          <span className="chat-profile__count">
            {attachmentsLoading ? "…" : photoCount}
          </span>
        </div>

        <div className="chat-profile__item">
          <span>▤ {t("chat.files")}</span>
          <span className="chat-profile__count">
            {attachmentsLoading ? "…" : fileCount}
          </span>
        </div>

        <div className="chat-profile__item">
          <span>♬ {t("chat.voiceMessages")}</span>
          <span className="chat-profile__count">
            {attachmentsLoading ? "…" : voiceCount}
          </span>
        </div>
      </div>

      <div className="chat-profile__section chat-profile__actions">
        <button
          type="button"
          onClick={() => void onRemoveFriend()}
          disabled={isActionLoading}
        >
          {t("chat.removeFriend")}
        </button>

        <button
          type="button"
          onClick={() => void onClearHistory()}
          disabled={isActionLoading}
        >
          {t("chat.clearHistory")}
        </button>

        <button
          type="button"
          onClick={() => void onToggleBlock()}
          disabled={isActionLoading || otherUserBlockedMe}
          title={
            otherUserBlockedMe
              ? t("chat.userBlockedYou")
              : undefined
          }
        >
          {isBlocked
            ? t("chat.unblock")
            : t("chat.block")}
        </button>

        <button
          type="button"
          onClick={() => void onReportUser()}
          disabled={isActionLoading}
        >
          {t("chat.report")}
        </button>
      </div>
    </aside>
  );
}
