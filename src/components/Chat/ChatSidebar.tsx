
import { useState } from "react";

import { useChatConversations } from "../../hooks/useChatConvertations";
import type { ChatConversation } from "../../types/chat";

import "./ChatSidebar.css";

interface ChatSidebarProps {
  selectedFriendId: string | null;
  onSelectConversation: (conversation: ChatConversation) => void;
}

export default function ChatSidebar({
  selectedFriendId,
  onSelectConversation,
}: ChatSidebarProps) {
  const [search, setSearch] = useState("");

  const {
    conversations,
    isLoading,
    error,
    loadConversations,
  } = useChatConversations();

  function handleSearch(value: string) {
    setSearch(value);
    void loadConversations(value);
  }

  return (
    <aside className="chat-sidebar">
      <div className="chat-sidebar__header">
        <h2>Повідомлення</h2>

        <input
          className="chat-sidebar__search"
          type="search"
          placeholder="Пошук діалогів..."
          value={search}
          onChange={(event) => handleSearch(event.target.value)}
        />
      </div>

      <div className="chat-sidebar__list">
        {isLoading && (
          <p className="chat-sidebar__status">
            Завантаження діалогів...
          </p>
        )}

        {!isLoading && error && (
          <p className="chat-sidebar__status chat-sidebar__status--error">
            {error}
          </p>
        )}

        {!isLoading && !error && conversations.length === 0 && (
          <p className="chat-sidebar__status">
            Діалогів не знайдено.
          </p>
        )}

        {!isLoading &&
          !error &&
          conversations.map((conversation) => (
            <button
              className={`chat-conversation ${
                selectedFriendId === conversation.friendId
                  ? "chat-conversation--active"
                  : ""
              }`}
              key={conversation.friendId}
              type="button"
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="chat-conversation__avatar">
                {conversation.avatarUrl ? (
                  <img src={conversation.avatarUrl} alt="" />
                ) : (
                  <span>
                    {conversation.username.charAt(0).toUpperCase()}
                  </span>
                )}

                <span
                  className={`chat-conversation__status ${
                    conversation.isOnline ? "is-online" : ""
                  }`}
                />
              </div>

              <div className="chat-conversation__body">
                <div className="chat-conversation__top">
                  <span className="chat-conversation__name">
                    {conversation.username}
                  </span>

                  {conversation.lastMessageDateFormatted && (
                    <time className="chat-conversation__time">
                      {conversation.lastMessageDateFormatted}
                    </time>
                  )}
                </div>

                <div className="chat-conversation__bottom">
                  <span className="chat-conversation__preview">
                    {conversation.lastMessagePreview ||
                      "Почніть спілкування"}
                  </span>

                  {conversation.unreadCount > 0 && (
                    <span className="chat-conversation__unread">
                      {conversation.unreadCount > 99
                        ? "99+"
                        : conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
      </div>
    </aside>
  );
}
