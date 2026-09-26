import { apiRequest } from "./client";

interface MediaUploadResponse{
    url: string;
}

async function uploadMedia(endpoint:string, file: File) : Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiRequest<MediaUploadResponse>(
        endpoint,
        {
            method: "POST",
            body: formData,
        }
    );
    return response.url;
}

export async function  uploadScreenshot(file:File) : Promise<string> {
    return uploadMedia("/api/Media/screenshot", file);
}
export async function uploadVideo(file:File) : Promise<string> {
    return uploadMedia("/api/Media/video", file);
}