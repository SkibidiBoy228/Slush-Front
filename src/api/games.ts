
import type { GameDetails } from "../types/game";
import type { CatalogResponse } from "../types/catalog";

const API_URL = import.meta.env.VITE_API_URL;

export async function getGames(params?: {
  query?: string;
  source?: number;
  minDiscount?: number;
  page?: number;
  pageSize?: number;
}): Promise<CatalogResponse> {
  const searchParams = new URLSearchParams();

  if (params?.query) {
    searchParams.set("query", params.query);
  }

  if (params?.source !== undefined) {
    searchParams.set("source", String(params.source));
  }

  if (params?.minDiscount !== undefined) {
    searchParams.set("minDiscount", String(params.minDiscount));
  }

  searchParams.set("page", String(params?.page ?? 1));
  searchParams.set("pageSize", String(params?.pageSize ?? 12));

  const response = await fetch(
    `${API_URL}/api/GameCatalog?${searchParams.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Не вдалося завантажити список ігор"
    );
  }

  return data as CatalogResponse;
}

export async function getGameDetails(
  appId: string
): Promise<GameDetails> {
  const response = await fetch(
    `${API_URL}/api/GameCatalog/${encodeURIComponent(appId)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Не вдалося завантажити інформацію про гру"
    );
  }

  const rawScreenshots =
    data.screenshots ??
    data.Screenshots ??
    [];

  const rawVideos =
    data.videos ??
    data.Videos ??
    [];

  const screenshots = rawScreenshots.map((screenshot: any) => ({
    id: screenshot.id ?? screenshot.Id ?? 0,
    image: screenshot.image ?? screenshot.Image ?? "",
  })).filter((screenshot: any) => screenshot.image);

  const videos = rawVideos.map((video: any) => ({
    id: video.id ?? video.Id ?? 0,
    name: video.name ?? video.Name ?? "",
    thumbnailUrl:
      video.thumbnailUrl ??
      video.ThumbnailUrl ??
      "",
    videoUrlWebm:
      video.videoUrlWebm ??
      video.VideoUrlWebm ??
      "",
    videoUrlMp4:
      video.videoUrlMp4 ??
      video.VideoUrlMp4 ??
      "",
  })).filter(
    (video: any) => video.videoUrlMp4 || video.videoUrlWebm
  );

  return {
    ...data,

    id: data.id ?? data.Id,
    title: data.title ?? data.Title ?? "",
    description: data.description ?? data.Description ?? "",
    thumbnail: data.thumbnail ?? data.Thumbnail ?? "",

    pcRequirements:
      data.pcRequirements ??
      data.PcRequirements ??
      { minimum: "", recommended: "" },

    dLcs:
      data.dLcs ??
      data.dlCs ??
      data.DLCs ??
      data.dlcs ??
      [],

    bundles:
      data.bundles ??
      data.Bundles ??
      [],

    screenshots,
    videos,

    reviews:
      data.reviews ??
      data.Reviews ??
      [],

    friendsPlaying:
      data.friendsPlaying ??
      data.FriendsPlaying ??
      [],

    tags:
      data.tags ??
      data.Tags ??
      [],

    isInWishlist:
      data.isInWishlist ??
      data.IsInWishlist ??
      false,

    isInCart:
      data.isInCart ??
      data.IsInCart ??
      false,
  };
}
