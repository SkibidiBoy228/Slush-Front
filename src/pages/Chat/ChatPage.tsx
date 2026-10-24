
import { useCallback, useEffect, useState } from "react";

import Header from "../../components/Header/Header";
import ChatSidebar from "../../components/Chat/ChatSidebar";
import ChatWindow from "../../components/Chat/ChatWindow";

import { removeFriend } from "../../api/friends";
import {
  clearChatHistory,
  setChatBlock,
  reportChatUser,
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

function getMessagePreview(message: ChatMessage): string {
  switch (message.messageType) {
    case "Image":
      return "📷 Зображення";
    case "File":
      return `📎 ${message.fileName || "Файл"}`;
    case "Voice":
      return "🎤 Голосове повідомлення";
    default:
      return message.content || "";
  }
}

export default function ChatPage() {
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
    0,
  );

  const fileCount = fileGroups.reduce(
    (total, group) => total + group.items.length,
    0,
  );

  const voiceCount = voiceGroups.reduce(
    (total, group) => total + group.items.length,
    0,
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

      if (
        selectedConversation?.friendId === message.senderId &&
        !message.isMine
      ) {
        addIncomingMessage(message);
      }

      window.dispatchEvent(
        new CustomEvent("slush:chat-message", {
          detail: {
            message,
            shouldNotify: payload.shouldNotify,
            preview: getMessagePreview(message),
          },
        }),
      );
    },
    [selectedConversation?.friendId, addIncomingMessage],
  );

  const { isConnected, connectionError } = useChatConnection({
    onMessage: handleIncomingMessage,
  });

  const handleSendMessage = useCallback(
    async (request: SendChatMessageRequest) => {
      const sentMessage = await sendMessage(request);

      if (!sentMessage) {
        throw new Error("Не вдалося надіслати повідомлення.");
      }
    },
    [sendMessage],
  );

  const handleSelectConversation = useCallback(
    (conversation: ChatConversation) => {
      setSelectedConversation(conversation);
    },
    [],
  );

  const handleRemoveFriend = useCallback(async () => {
    if (!selectedConversation || isActionLoading) {
      return;
    }

    const confirmed = window.confirm(
      `Видалити ${selectedConversation.username} з друзів?`,
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
      console.error("Не вдалося видалити друга:", error);
      window.alert("Не вдалося видалити друга. Спробуйте ще раз.");
    } finally {
      setIsActionLoading(false);
    }
  }, [selectedConversation, isActionLoading]);

  const handleClearHistory = useCallback(async () => {
    if (!selectedConversation || isActionLoading) {
      return;
    }

    const confirmed = window.confirm(
      `Очистити історію чату з ${selectedConversation.username}? Ця дія приховає історію для вас.`,
    );

    if (!confirmed) {
      return;
    }

    setIsActionLoading(true);

    try {
      await clearChatHistory(selectedConversation.friendId);
      setMessages([]);

      window.alert("Історію чату очищено.");
    } catch (error) {
      console.error("Не вдалося очистити історію чату:", error);
      window.alert("Не вдалося очистити історію чату. Спробуйте ще раз.");
    } finally {
      setIsActionLoading(false);
    }
  }, [selectedConversation, isActionLoading, setMessages]);

  const handleToggleBlock = useCallback(async () => {
    if (!selectedConversation || isActionLoading) {
      return;
    }

    const nextBlockedState = !isBlocked;

    const confirmed = window.confirm(
      nextBlockedState
        ? `Заблокувати ${selectedConversation.username}?`
        : `Розблокувати ${selectedConversation.username}?`,
    );

    if (!confirmed) {
      return;
    }

    setIsActionLoading(true);

    try {
      const result = await setChatBlock(
        selectedConversation.friendId,
        nextBlockedState,
      );

      setIsBlocked(result.isBlocked);

      setSelectedConversation((current) =>
        current
          ? ({
              ...current,
              isBlockedByMe: result.isBlocked,
            } as ConversationWithBlockStatus)
          : current,
      );

      window.alert(
        result.isBlocked
          ? "Користувача заблоковано."
          : "Користувача розблоковано.",
      );

      window.dispatchEvent(new CustomEvent("slush:chat-block-updated"));
    } catch (error) {
      console.error("Не вдалося змінити блокування:", error);
      window.alert("Не вдалося змінити блокування. Спробуйте ще раз.");
    } finally {
      setIsActionLoading(false);
    }
  }, [selectedConversation, isBlocked, isActionLoading]);

  const handleReportUser = useCallback(async () => {
    if (!selectedConversation || isActionLoading) {
      return;
    }

    const reason = window.prompt(
      "Вкажіть причину скарги:\n\n1 — Спам\n2 — Образи або переслідування\n3 — Неприйнятний контент\n4 — Шахрайство\n5 — Інше",
    );

    if (reason === null) {
      return;
    }

    const reasonOptions: Record<string, string> = {
      "1": "Спам",
      "2": "Образи або переслідування",
      "3": "Неприйнятний контент",
      "4": "Шахрайство",
      "5": "Інше",
    };

    const normalizedReason = reasonOptions[reason.trim()];

    if (!normalizedReason) {
      window.alert("Оберіть причину від 1 до 5.");
      return;
    }

    const details = window.prompt(
      "Додайте коментар до скарги (необов'язково):",
    );

    if (details === null) {
      return;
    }

    setIsActionLoading(true);

    try {
      await reportChatUser(
        selectedConversation.friendId,
        normalizedReason,
        details.trim() || undefined,
      );

      window.alert("Скаргу надіслано. Дякуємо за повідомлення.");
    } catch (error) {
      console.error("Не вдалося надіслати скаргу:", error);
      window.alert("Не вдалося надіслати скаргу. Спробуйте ще раз.");
    } finally {
      setIsActionLoading(false);
    }
  }, [selectedConversation, isActionLoading]);

  return (
    <div className="chat-page">
      <Header />

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
                  ? "Чат підключено"
                  : "Підключення до чату...")}
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
  if (!conversation) {
    return (
      <aside className="chat-profile chat-profile--empty">
        <p>Оберіть співрозмовника</p>
      </aside>
    );
  }

  const profileUrl = `/profile/${encodeURIComponent(
    conversation.username,
  )}`;

  const otherUserBlockedMe = Boolean(
    (conversation as ConversationWithBlockStatus).hasBlockedMe,
  );

  return (
    <aside className="chat-profile">
      <div className="chat-profile__identity">
        <a
          href={profileUrl}
          className="chat-profile__avatar"
          aria-label={`Відкрити профіль ${conversation.username}`}
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
          {conversation.isOnline ? "У мережі" : "Не в мережі"}
        </span>
      </div>

      <div className="chat-profile__setting">
        <span>Сповіщення</span>
        <span>
          {conversation.notificationsEnabled ? "Увімкнено" : "Вимкнено"}
        </span>
      </div>

      <div className="chat-profile__section">
        <div className="chat-profile__item">
          <span>▧ Фото</span>
          <span className="chat-profile__count">
            {attachmentsLoading ? "…" : photoCount}
          </span>
        </div>

        <div className="chat-profile__item">
          <span>▤ Файли</span>
          <span className="chat-profile__count">
            {attachmentsLoading ? "…" : fileCount}
          </span>
        </div>

        <div className="chat-profile__item">
          <span>♬ Голосові повідомлення</span>
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
          Видалити з друзів
        </button>

        <button
          type="button"
          onClick={() => void onClearHistory()}
          disabled={isActionLoading}
        >
          Очистити історію
        </button>

        <button
          type="button"
          onClick={() => void onToggleBlock()}
          disabled={isActionLoading || otherUserBlockedMe}
          title={
            otherUserBlockedMe
              ? "Цей користувач заблокував вас"
              : undefined
          }
        >
          {isBlocked ? "Розблокувати" : "Заблокувати"}
        </button>

        <button
          type="button"
          onClick={() => void onReportUser()}
          disabled={isActionLoading}
        >
          Поскаржитися
        </button>
      </div>
    </aside>
  );
}
