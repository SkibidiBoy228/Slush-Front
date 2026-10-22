
import { useState, type FormEvent, type KeyboardEvent } from "react";

import "./ChatInput.css";

interface ChatInputProps {
  onSend: (text: string) => Promise<void>;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  disabled = false,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = text.trim();

    if (!message || disabled || isSending) {
      return;
    }

    setIsSending(true);

    try {
      await onSend(message);
      setText("");
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <textarea
        className="chat-input__field"
        placeholder="Напишіть повідомлення..."
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || isSending}
        rows={1}
      />

      <button
        className="chat-input__send"
        type="submit"
        disabled={disabled || isSending || !text.trim()}
        aria-label="Надіслати повідомлення"
        title="Надіслати"
      >
        <svg
          viewBox="0 0 24 24"
          width="21"
          height="21"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M22 2 11 13" />
          <path d="m22 2-7 20-4-9-9-4Z" />
        </svg>
      </button>
    </form>
  );
}
