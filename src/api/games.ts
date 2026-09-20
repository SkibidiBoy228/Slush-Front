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

  return {
    ...data,

    pcRequirements:
      data.pcRequirements ??
      data.PcRequirements ??
      undefined,

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

    screenshots:
      data.screenshots ??
      data.Screenshots ??
      [],

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