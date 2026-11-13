
import {
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const swipeStartYRef = useRef<number | null>(null);

  const busy = disabled || isSending;

  function handleModeSwipeStart(event: PointerEvent<HTMLDivElement>) {
    if (busy || isRecording) return;

    swipeStartYRef.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleModeSwipeEnd(event: PointerEvent<HTMLDivElement>) {
    const startY = swipeStartYRef.current;
    swipeStartYRef.current = null;

    if (startY === null || busy || isRecording) return;

    if (event.clientY - startY < -35) {
      setIsVoiceMode((current) => !current);
    }
  }

  function handleModeSwipeCancel() {
    swipeStartYRef.current = null;
  }

  function handleModeHandleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (!busy && !isRecording) {
        setIsVoiceMode((current) => !current);
      }
    }
  }

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
      setError(t("chatInput.sendError"));
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
      setError(t("chatInput.uploadError"));
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
        throw new Error("Screen capture is not supported.");
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
      if (!context) {
        throw new Error("Failed to capture screenshot.");
      }

      context.drawImage(video, 0, 0);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) resolve(result);
          else reject(new Error("Failed to create image."));
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
      setError(t("chatInput.screenshotError"));
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
          setError(t("chatInput.voiceError"));
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

      setError(t("chatInput.microphoneError"));
    }
  }

  function stopRecording() {
    const recorder = recorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  }

  return (
    <div className={`chat-input-wrapper ${isVoiceMode ? "is-voice-mode" : ""}`}>
      <div
        className={`chat-input__mode-swipe ${isVoiceMode ? "is-voice-mode" : ""}`}
        role="button"
        tabIndex={busy || isRecording ? -1 : 0}
        aria-label={
          isVoiceMode
            ? t("chatInput.switchToText")
            : t("chatInput.switchToVoice")
        }
        onPointerDown={handleModeSwipeStart}
        onPointerUp={handleModeSwipeEnd}
        onPointerCancel={handleModeSwipeCancel}
        onKeyDown={handleModeHandleKeyDown}
      >
        <span className="chat-input__mode-swipe-line" />
        <span>
          {isVoiceMode
            ? t("chatInput.voiceModeHint")
            : t("chatInput.textModeHint")}
        </span>
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

      <form
        className={`chat-input ${isVoiceMode ? "is-voice-mode" : ""}`}
        onSubmit={handleSubmit}
      >
        <div className="chat-input__attachments">
          <button
            type="button"
            title={t("chatInput.sendImage")}
            aria-label={t("chatInput.sendImage")}
            disabled={busy}
            onClick={() => imageInputRef.current?.click()}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="4" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </button>

          <button
            type="button"
            title={t("chatInput.takeScreenshot")}
            aria-label={t("chatInput.takeScreenshot")}
            disabled={busy}
            onClick={() => void handleScreenshot()}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 3H5a2 2 0 0 0-2 2v3" />
              <path d="M16 3h3a2 2 0 0 1 2 2v3" />
              <path d="M21 16v3a2 2 0 0 1-2 2h-3" />
              <path d="M3 16v3a2 2 0 0 0 2 2h3" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>

          <button
            type="button"
            title={t("chatInput.attachFile")}
            aria-label={t("chatInput.attachFile")}
            disabled={busy}
            onClick={() => fileInputRef.current?.click()}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m21.4 11.1-8.5 8.5a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5" />
            </svg>
          </button>

          <button
            type="button"
            title={
              isRecording
                ? t("chatInput.stopRecording")
                : t("chatInput.recordVoice")
            }
            aria-label={
              isRecording
                ? t("chatInput.stopRecording")
                : t("chatInput.recordVoice")
            }
            className={isRecording ? "is-recording" : ""}
            disabled={busy && !isRecording}
            onClick={isRecording ? stopRecording : () => void startRecording()}
          >
            {isRecording ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="9" y="2" width="6" height="12" rx="3" />
                <path d="M5 10a7 7 0 0 0 14 0" />
                <path d="M12 17v5" />
                <path d="M8 22h8" />
              </svg>
            )}
          </button>

          {isRecording && (
            <span className="chat-input__recording">
              {t("chatInput.recording")}
            </span>
          )}
        </div>

        <textarea
          className="chat-input__field"
          placeholder={t("chatInput.placeholder")}
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
          aria-label={t("chatInput.sendMessage")}
          title={t("chatInput.send")}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
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
