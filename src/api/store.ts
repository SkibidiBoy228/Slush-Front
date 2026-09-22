import { apiRequest } from "./client";

export interface StoreItem {
    gameId: string;
    title: string;
    imageUrl: string;
    price: number;
    oldPrice: number;
    discountPercent: number;
    addedAt: string;
}

export interface AddToStoreRequest {
    gameId: string;
    title: string;
    imageUrl: string;
    price: number;
    oldPrice: number;
    discountPercent: number;
}

export function getWishlist(): Promise<StoreItem[]> {
    return apiRequest<StoreItem[]>("/api/Wishlist");
}

export function addToWishlist(
    game: AddToStoreRequest
): Promise<void> {
    return apiRequest<void>("/api/Wishlist", {
        method: "POST",
        body: JSON.stringify(game),
    });
}

export function removeFromWishlist(
    gameId: string
): Promise<void> {
    return apiRequest<void>(
        `/api/Wishlist/${encodeURIComponent(gameId)}`,
        {
            method: "DELETE",
        }
    );
}

export function getCart(): Promise<StoreItem[]> {
    return apiRequest<StoreItem[]>("/api/Cart");
}

export function addToCart(
    game: AddToStoreRequest
): Promise<void> {
    return apiRequest<void>("/api/Cart", {
        method: "POST",
        body: JSON.stringify(game),
    });
}

export function removeFromCart(
    gameId: string
): Promise<void> {
    return apiRequest<void>(
        `/api/Cart/${encodeURIComponent(gameId)}`,
        {
            method: "DELETE",
        }
    );
}

export function clearCart(): Promise<void> {
    return apiRequest<void>("/api/Cart/clear", {
        method: "DELETE",
    });
}