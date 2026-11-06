import { useRef, useState } from "react";

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

interface VoicePlayerProps {
  src: string;
}

function formatAudioTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function VoicePlayer({ src }: VoicePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const progress = duration > 0
    ? (currentTime / duration) * 100
    : 0;

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Audio playback failed:", error);
        setIsPlaying(false);
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }

  function handleSeek(event: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Number(event.target.value);

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }

  const waveform = [
    30, 48, 65, 42, 75, 54, 35, 62, 82,
    47, 32, 58, 72, 44, 88, 60, 38, 52,
    76, 45, 64, 34, 80, 55, 42, 69, 50,
    86, 40, 60, 74, 35, 55, 78, 46, 62,
  ];

  return (
    <div className="voice-player">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration || 0);
        }}
        onTimeUpdate={(event) => {
          setCurrentTime(event.currentTarget.currentTime);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />

      <button
        type="button"
        className="voice-player__button"
        onClick={() => void togglePlayback()}
        aria-label={isPlaying ? "Пауза" : "Відтворити"}
      >
        {isPlaying ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5.5v13l11-6.5z" />
          </svg>
        )}
      </button>

      <div className="voice-player__content">
        <div className="voice-player__waveform">
          <div className="voice-player__bars">
            {waveform.map((height, index) => (
              <span
                key={index}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>

          <div
            className="voice-player__progress"
            style={{ width: `${progress}%` }}
          >
            <div className="voice-player__progress-bars">
              {waveform.map((height, index) => (
                <span
                  key={index}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>

          <input
            className="voice-player__seek"
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            onChange={handleSeek}
            aria-label="Прогрес відтворення"
            disabled={!duration}
          />
        </div>

        <div className="voice-player__time">
          <span>{formatAudioTime(currentTime)}</span>
          <span>{formatAudioTime(duration)}</span>
        </div>
      </div>

      <div className="voice-player__icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0" />
          <path d="M12 17v5" />
          <path d="M8 22h8" />
        </svg>
      </div>
    </div>
  );
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
                    <VoicePlayer src={message.mediaUrl} />
                  )}

                  {message.messageType === "File" && message.mediaUrl && (
                    /\.(mp4|webm|ogg|mov|m4v)$/i.test(message.fileName ?? "") ? (
                      <div className="chat-message__video">
                        <video
                          src={message.mediaUrl}
                          controls
                          preload="metadata"
                          playsInline
                        >
                          Ваш браузер не підтримує відтворення відео.
                        </video>

                        {message.content && <p>{message.content}</p>}

                        <a
                          href={message.mediaUrl}
                          target="_blank"
                          rel="noreferrer"
                          download={message.fileName || undefined}
                        >
                          Завантажити відео
                        </a>
                      </div>
                    ) : (
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
                    )
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