
import { useCallback, useState } from "react";

import Header from "../../components/Header/Header";
import ChatSidebar from "../../components/Chat/ChatSidebar";
import ChatWindow from "../../components/Chat/ChatWindow";

import { removeFriend } from "../../api/friends";
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

  const {
    messages,
    isLoading,
    isSending,
    sendMessage,
    addIncomingMessage,
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
    if (!selectedConversation) {
      return;
    }

    const confirmed = window.confirm(
      `Видалити ${selectedConversation.username} з друзів?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await removeFriend(selectedConversation.friendId);
      setSelectedConversation(null);

      window.dispatchEvent(
        new CustomEvent("slush:friends-updated"),
      );
    } catch (error) {
      console.error("Не вдалося видалити друга:", error);

      window.alert(
        "Не вдалося видалити друга. Спробуйте ще раз.",
      );
    }
  }, [selectedConversation]);

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
          onRemoveFriend={handleRemoveFriend}
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
  onRemoveFriend: () => void;
}

function ChatProfilePanel({
  conversation,
  photoCount,
  fileCount,
  voiceCount,
  attachmentsLoading,
  onRemoveFriend,
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
            <span>
              {conversation.username.charAt(0).toUpperCase()}
            </span>
          )}
        </a>

        <a
          href={profileUrl}
          className="chat-profile__username"
        >
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
          onClick={onRemoveFriend}
        >
          Видалити з друзів
        </button>

        <button
          type="button"
          disabled
          title="Функцію ще не підключено"
        >
          Очистити історію
        </button>

        <button
          type="button"
          disabled
          title="Функцію ще не підключено"
        >
          Заблокувати
        </button>

        <button
          type="button"
          disabled
          title="Функцію ще не підключено"
        >
          Поскаржитися
        </button>
      </div>
    </aside>
  );
}
