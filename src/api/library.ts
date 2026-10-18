import { apiRequest } from "./client";

import type {
    CommunityPost,
    CreateLibraryCollectionRequest,
    GameLibraryContext,
    LibraryCollection,
    LibraryFeedParams,
    LibraryGame,
    LibraryHome,
    LibraryQueryParams,
    PagedResult,
    SaveGameReviewRequest,
    UpdateLibraryCollectionRequest,
    UserGameReview,
} from "../types/library";

const BASE_URL = "/api/Library";

export function getLibrary(params: LibraryQueryParams = {},):Promise<PagedResult<LibraryGame>>{
    const query = new URLSearchParams();
    if(params.sort) query.set("sort", params.sort);
    if(params.page !== undefined){
        query.set("page", String(params.page));
    }
    if(params.pageSize !== undefined){
        query.set("pageSize", String(params.pageSize));
    }
    const queryString = query.toString();
    return apiRequest<PagedResult<LibraryGame>>(`${BASE_URL}${queryString ? `?${queryString}`: ""}`);
}
export function getFavoriteGames(): Promise<LibraryGame[]>{
    return apiRequest<LibraryGame[]>(`${BASE_URL}/favorites`);
}
export function addFavoriteGame(gameId: string): Promise<void>{
    return apiRequest<void>(`${BASE_URL}/${encodeURIComponent(gameId)}/favorite`, {method:"POST"},);
}
export function removeFavoriteGame(gameId: string) : Promise<void>{
    return apiRequest<void>(`${BASE_URL}/${encodeURIComponent(gameId)}/favorite`, {method: "DELETE"});
}
export function getLibraryCollections(): Promise<LibraryCollection[]>{
    return apiRequest<LibraryCollection[]>(`${BASE_URL}/collections`)
}
export function createLibraryCollection(data: CreateLibraryCollectionRequest, ): Promise<LibraryCollection>{
    return apiRequest<LibraryCollection>(`${BASE_URL}/collections`,{
        method:"POST",
        body: JSON.stringify(data),
    })
}
export function UpdateLibraryCollection(collectionId: string, data: UpdateLibraryCollectionRequest,) : Promise<void>{
    return apiRequest<void>(`${BASE_URL}/collections/${encodeURIComponent(collectionId)}`,{
        method: "PUT",
        body: JSON.stringify(data),
    })
}
export function deleteLibraryCollection(collectionId: string): Promise<void>{
    return apiRequest<void>(`${BASE_URL}/collections/${encodeURIComponent(collectionId)}`, {method: "DELETE"});
}
export function addGameToCollections(
    collectionId: string,
    gameId: string,
): Promise<void>{
    return apiRequest<void>(`${BASE_URL}/collections/${encodeURIComponent(collectionId)}/games/${encodeURIComponent(gameId)}`, {method: "POST"});
}
export function removeGameFromCollection(collectionId: string, gameId :  string,) : Promise<void>{
    return apiRequest<void>(`${BASE_URL}/collections/${encodeURIComponent(collectionId)}/games/${encodeURIComponent(gameId)}`, {method: "DELETE"})
}
export function getCollectionGames(collectionId: string) : Promise<LibraryGame[]>{
    return apiRequest<LibraryGame[]>(`${BASE_URL}/collections/${encodeURIComponent(collectionId)}/games`);
}
export function getLibraryHome() : Promise<LibraryHome>{
    return apiRequest<LibraryHome>(`${BASE_URL}/home`);
}
export function getLibraryFeed(params: LibraryFeedParams = {}): Promise<PagedResult<CommunityPost>>{
    const query = new URLSearchParams();
    if(params.source) query.set("source", params.source);
    if(params.type) query.set("type", params.type);
    if(params.sort) query.set("sort", params.sort);
    if(params.page !== undefined){
        query.set("page", String(params.page));
    }
    if(params.pageSize !== undefined){
        query.set("pageSize", String(params.pageSize));
    }
    const queryString = query.toString();
    return apiRequest<PagedResult<CommunityPost>>(`${BASE_URL}/feed${queryString ? `?${queryString}` : ""}`);
}
export function getGameLibraryContext(gameId: string) : Promise<GameLibraryContext>{
    return apiRequest<GameLibraryContext>(
        `${BASE_URL}/game/${encodeURIComponent(gameId)}`
    );
}
export function getMyGameReview(gameId: string) : Promise<UserGameReview | null>{
    return apiRequest<UserGameReview | null>(`${BASE_URL}/game/${encodeURIComponent(gameId)}/review`);
}
export function createGameReview(gameId: string, data : SaveGameReviewRequest,) : Promise<UserGameReview>{
    return apiRequest<UserGameReview>(`${BASE_URL}/game/${encodeURIComponent(gameId)}/review`,{
        method: "POST",
        body: JSON.stringify(data),
    });
}
export function updateGameReview(gameId: string, data: SaveGameReviewRequest) : Promise<UserGameReview>{
    return apiRequest<UserGameReview>(`${BASE_URL}/game/${encodeURIComponent(gameId)}/review`, {
        method: "PUT",
        body: JSON.stringify(data),
    })
}
export function deleteGameReview(gameId: string): Promise<void> {
  return apiRequest<void>(
    `${BASE_URL}/game/${encodeURIComponent(gameId)}/review`,
    { method: "DELETE" },
  );
}
export function checkoutLibraryGame(
  gameId: string,
): Promise<void> {
  return apiRequest<void>(`${BASE_URL}/checkout`, {
    method: "POST",
    body: JSON.stringify({ gameId }),
  });
}