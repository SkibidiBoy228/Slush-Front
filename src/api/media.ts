
import { apiRequest } from "./client";

export interface ChatMediaUploadResponse {
  url: string;
  fileName: string;
  fileSize: number;
  formattedFileSize: string;
  durationSeconds: number | null;
}

interface MediaUploadResponse {
  url: string;
}


async function uploadMedia(
  endpoint: string,
  file: File,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiRequest<MediaUploadResponse>(
    endpoint,
    {
      method: "POST",
      body: formData,
    },
  );

  return response.url;
}


async function uploadChatMedia(
  endpoint: string,
  file: File,
  durationSeconds?: number,
): Promise<ChatMediaUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  if (durationSeconds !== undefined) {
    formData.append("durationSeconds", String(durationSeconds));
  }

  return apiRequest<ChatMediaUploadResponse>(
    endpoint,
    {
      method: "POST",
      body: formData,
    },
  );
}

export async function uploadScreenshot(
  file: File,
): Promise<string> {
  return uploadMedia("/api/Media/screenshot", file);
}

export async function uploadVideo(
  file: File,
): Promise<string> {
  return uploadMedia("/api/Media/video", file);
}


export async function uploadChatFile(
  file: File,
): Promise<ChatMediaUploadResponse> {
  return uploadChatMedia("/api/Media/chat-file", file);
}


export async function uploadChatVoice(
  file: File,
  durationSeconds?: number,
): Promise<ChatMediaUploadResponse> {
  return uploadChatMedia(
    "/api/Media/chat-voice",
    file,
    durationSeconds,
  );
}
