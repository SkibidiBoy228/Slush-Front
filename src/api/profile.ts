
import type{
    UserProfile,
    ProfileReview,
    ProfileGuide,
    ProfileComment,
    ProfileGame,
    ProfilePost,
    ProfileScreenshot,
    ProfileVideo,
    PagedResult,

} from "../types/profile";

import { apiRequest,getAccessToken } from "./client";

const API_URL = import.meta.env.VITE_API_URL;

async function profileRequest<T>(url: string): Promise<T>{
    const response = await fetch(`${API_URL}${url}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();

    if(!response.ok){
        throw new Error(
            data?.message || "Не вдалося завантажити дані профілю"
        );
    }

    return data as T;
}

function profilePath(username: string): string{
    return `/api/UserProfile/${encodeURIComponent(username)}`;
}

export async function getUserProfile(
    username:string
): Promise<UserProfile>{
    return profileRequest<UserProfile>(profilePath(username));
}

export async function getProfileGames(
    username:string
): Promise<PagedResult<ProfileGame>>{
    return profileRequest<PagedResult<ProfileGame>>(
        `${profilePath(username)}/games?page=1&pageSize=12`
    );
}

export async function getProfilePosts(
    username:string
):Promise<PagedResult<ProfilePost>>{
    return profileRequest<PagedResult<ProfilePost>>(
        `${profilePath(username)}/posts?page=1&pageSize=10`
    );
}

export async function getProfileScreenshots(
    username:string
):Promise<PagedResult<ProfileScreenshot>>{
    return profileRequest<PagedResult<ProfileScreenshot>>(
        `${profilePath(username)}/screenshots?page=1&pageSize=10`
    );
}

export async function getProfileVideos(
    username: string
): Promise<PagedResult<ProfileVideo>>{
    return profileRequest<PagedResult<ProfileVideo>>(
        `${profilePath(username)}/videos?page=1&pageSize=10`
    );
}

export async function getProfileReviews(
    username:string
): Promise<PagedResult<ProfileReview>>{
    return profileRequest<PagedResult<ProfileReview>>(
        `${profilePath(username)}/reviews?page=1&pageSize=5`
    );
}

export async function getProfileGuides(
    username:string
): Promise<PagedResult<ProfileGuide>>{
    return profileRequest<PagedResult<ProfileGuide>>(
        `${profilePath(username)}/guides?page=1&pageSize=5`
    );
}

export async function getProfileComments(
    username:string
): Promise<PagedResult<ProfileComment>>{
    return profileRequest<PagedResult<ProfileComment>>(
        `${profilePath(username)}/comments?page=1&pageSize=10`
    );
}

async function uploadMedia(
  endpoint: "avatar" | "banner",
  file: File
): Promise<{ url: string }> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Необхідно авторизуватися");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/api/Media/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const contentType = response.headers.get("content-type");

  const data = contentType?.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(
      typeof data === "string"
        ? data
        : data?.message || "Не вдалося завантажити зображення"
    );
  }

  return data as { url: string };
}
export async function uploadAvatar(file:File) : Promise<{url: string}> {
    return uploadMedia("avatar", file);
}

export async function uploadBanner(file: File): Promise<{ url: string }> {
  return uploadMedia("banner", file);
}

export interface UpdateProfileRequest{
    username?: string;
    bio?:string;
}

export interface UpdateProfileResponse{
    message: string;
    username: string;
    bio: string;
}

export async function updateProfile(
    data: UpdateProfileRequest
): Promise<UpdateProfileResponse>{
    return apiRequest<UpdateProfileResponse>("/api/UserProfile/settings",{
        method: "PUT",
        body: JSON.stringify(data)
    });
}

export interface UploadVideoRequest{
    file: File;
    gameId:string;
    gameTitle: string;
    title: string;
}

export interface UploadedVideoResponse{
    id: string;
    userId: string;
    gameId:string;
    gameTitle: string;
    title: string;
    videoUrl: string;
    thumbnailUrl: string;
    createdAt: string;
}

export async function uploadUserVideo(
    data: UploadVideoRequest
) : Promise<UploadedVideoResponse>{
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("gameId", data.gameId);
    formData.append("gameTitle", data.gameTitle);
    formData.append("title", data.title);
    return apiRequest<UploadedVideoResponse>("/api/Media/video",{
        method: "POST",
        body: formData,
    })
}