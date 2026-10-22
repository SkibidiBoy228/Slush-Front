
import {
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import {
  uploadChatFile,
  uploadChatVoice,
  uploadScreenshot,
} from "../../api/media";

import type { SendChatMessageRequest } from "../../types/chat";

import "./ChatInput.css";

interface ChatInputProps {
  onSend: (message: SendChatMessageRequest) => Promise<void>;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  disabled = false,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);

  const busy = disabled || isSending;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = text.trim();
    if (!content || busy) return;

    setIsSending(true);
    setError(null);

    try {
      await onSend({ messageType: "Text", content });
      setText("");
    } catch {
      setError("Не вдалося надіслати повідомлення.");
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

  async function handleMediaFile(file: File, isImage: boolean) {
    if (busy) return;

    setIsSending(true);
    setError(null);

    try {
      const uploaded = await uploadChatFile(file);

      await onSend({
        messageType: isImage ? "Image" : "File",
        mediaUrl: uploaded.url,
        fileName: uploaded.fileName || file.name,
        fileSize: uploaded.fileSize,
      });
    } catch {
      setError("Не вдалося завантажити або надіслати файл.");
    } finally {
      setIsSending(false);
    }
  }

  async function handleScreenshot() {
    if (busy) return;

    let stream: MediaStream | null = null;

    try {
      setError(null);

      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error("Захоплення екрана не підтримується.");
      }

      stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      await new Promise<void>((resolve) => {
        if (video.readyState >= 2) {
          resolve();
        } else {
          video.onloadeddata = () => resolve();
        }
      });

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      if (!context) throw new Error("Не вдалося зробити скриншот.");

      context.drawImage(video, 0, 0);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) resolve(result);
          else reject(new Error("Не вдалося створити зображення."));
        }, "image/png");
      });

      const screenshot = new File(
        [blob],
        `screenshot-${Date.now()}.png`,
        { type: "image/png" },
      );

      setIsSending(true);

      const url = await uploadScreenshot(screenshot);

      await onSend({
        messageType: "Image",
        mediaUrl: url,
        fileName: screenshot.name,
        fileSize: screenshot.size,
      });
    } catch (err) {
      console.error("Screenshot failed:", err);
      setError("Не вдалося зробити або надіслати скриншот.");
    } finally {
      stream?.getTracks().forEach((track) => track.stop());
      setIsSending(false);
    }
  }

  async function startRecording() {
    if (busy || isRecording) return;

    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const durationSeconds = Math.max(
          1,
          Math.round((Date.now() - startedAtRef.current) / 1000),
        );

        try {
          const blob = new Blob(chunksRef.current, {
            type: recorder.mimeType || "audio/webm",
          });

          if (!blob.size) return;

          const extension = blob.type.includes("ogg") ? "ogg" : "webm";
          const file = new File(
            [blob],
            `voice-${Date.now()}.${extension}`,
            { type: blob.type },
          );

          setIsSending(true);

          const uploaded = await uploadChatVoice(file, durationSeconds);

          await onSend({
            messageType: "Voice",
            mediaUrl: uploaded.url,
            fileName: uploaded.fileName || file.name,
            fileSize: uploaded.fileSize,
            durationSeconds,
          });
        } catch (err) {
          console.error("Voice message failed:", err);
          setError("Не вдалося надіслати голосове повідомлення.");
        } finally {
          streamRef.current?.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
          setIsRecording(false);
          setIsSending(false);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone unavailable:", err);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsRecording(false);
      setError("Не вдалося отримати доступ до мікрофона.");
    }
  }

  function stopRecording() {
    const recorder = recorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  }

  return (
    <div className="chat-input-wrapper">
      <div className="chat-input__attachments">
        <button
          type="button"
          title="Надіслати зображення"
          aria-label="Надіслати зображення"
          disabled={busy}
          onClick={() => imageInputRef.current?.click()}
        >
          ▧
        </button>

        <button
          type="button"
          title="Зробити скриншот"
          aria-label="Зробити скриншот"
          disabled={busy}
          onClick={() => void handleScreenshot()}
        >
          ⌗
        </button>

        <button
          type="button"
          title="Прикріпити файл"
          aria-label="Прикріпити файл"
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
        >
          📎
        </button>

        <button
          type="button"
          title={isRecording ? "Зупинити запис" : "Записати голосове повідомлення"}
          aria-label={isRecording ? "Зупинити запис" : "Записати голосове повідомлення"}
          disabled={busy && !isRecording}
          onClick={isRecording ? stopRecording : () => void startRecording()}
        >
          {isRecording ? "■" : "🎤"}
        </button>

        {isRecording && (
          <span className="chat-input__recording">
            Запис триває…
          </span>
        )}
      </div>

      <input
        ref={imageInputRef}
        hidden
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleMediaFile(file, true);
          event.target.value = "";
        }}
      />

      <input
        ref={fileInputRef}
        hidden
        type="file"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleMediaFile(file, false);
          event.target.value = "";
        }}
      />

      <form className="chat-input" onSubmit={handleSubmit}>
        <textarea
          className="chat-input__field"
          placeholder="Напишіть повідомлення..."
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={busy}
          rows={1}
        />

        <button
          className="chat-input__send"
          type="submit"
          disabled={busy || !text.trim()}
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

      {error && (
        <p className="chat-input__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
