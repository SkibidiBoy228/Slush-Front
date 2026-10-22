import type {
  ChatConversation,
  ChatMessage,
  SendChatMessageRequest,
} from "../../types/chat";

import ChatInput from "./ChatInput";
import "./ChatWindow.css";

interface ChatWindowProps {
  conversation: ChatConversation | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  onSendMessage: (message: SendChatMessageRequest) => Promise<void>;
}


export default function ChatWindow({
  conversation,
  messages,
  isLoading,
  isSending,
  onSendMessage,
}: ChatWindowProps) {
  if (!conversation) {
    return (
      <main className="chat-window chat-window--empty">
        <div className="chat-window__welcome">
          <div className="chat-window__welcome-icon">✉</div>
          <h2>Ваші повідомлення</h2>
          <p>Оберіть діалог, щоб почати спілкування.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="chat-window">
      <header className="chat-window__header">
        <div className="chat-window__avatar">
          {conversation.avatarUrl ? (
            <img src={conversation.avatarUrl} alt="" />
          ) : (
            <span>
              {conversation.username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="chat-window__user">
          <h2>{conversation.username}</h2>

          <span className={conversation.isOnline ? "is-online" : ""}>
            {conversation.isOnline ? "У мережі" : "Не в мережі"}
          </span>
        </div>
      </header>

      <section className="chat-window__messages">
        {isLoading && (
          <p className="chat-window__notice">
            Завантаження повідомлень...
          </p>
        )}

        {!isLoading && messages.length === 0 && (
          <p className="chat-window__notice">
            Повідомлень поки немає. Напишіть першим!
          </p>
        )}

        {messages.map((message, index) => {
          const previousMessage = messages[index - 1];

          const showDate =
            !previousMessage ||
            previousMessage.dateFormatted !== message.dateFormatted;

          return (
            <div key={message.id}>
              {showDate && (
                <div className="chat-window__date">
                  {message.dateFormatted}
                </div>
              )}

              <div
                className={`chat-message ${
                  message.isMine
                    ? "chat-message--mine"
                    : "chat-message--theirs"
                }`}
              >
                <div className="chat-message__bubble">
                  {message.messageType === "Text" && message.content}

                  {message.messageType === "Image" && message.mediaUrl && (
                    <div className="chat-message__media">
                      <img
                        src={message.mediaUrl}
                        alt="Зображення"
                        loading="lazy"
                      />

                      {message.content && <p>{message.content}</p>}
                    </div>
                  )}

                  {message.messageType === "File" && message.mediaUrl && (
                    <a
                      className="chat-message__file"
                      href={message.mediaUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span>📎</span>

                      <span>
                        <strong>{message.fileName || "Файл"}</strong>
                        <small>{message.formattedFileSize}</small>
                      </span>
                    </a>
                  )}

                  {message.messageType === "Voice" && message.mediaUrl && (
                    <audio
                      controls
                      preload="none"
                      src={message.mediaUrl}
                    >
                      Ваш браузер не підтримує відтворення аудіо.
                    </audio>
                  )}

                  <div className="chat-message__meta">
                    <time>{message.timeFormatted}</time>

                    {message.isMine && (
                      <span
                        title={
                          message.isRead
                            ? "Прочитано"
                            : "Надіслано"
                        }
                      >
                        {message.isRead ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <ChatInput
        onSend={onSendMessage}
        disabled={isSending}
      />
    </main>
  );
}
