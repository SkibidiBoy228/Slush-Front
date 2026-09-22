import { apiRequest } from "./client";

export interface StoreItem{
    gameId: string;
    title: string;
    imageUrl: string;
    price: number;
    addedAt: string;
}

export interface AddToStoreRequest{
    gameId: string;
    title: string;
    imageUrl: string;
    price: number;
}

export function getWishlist(): Promise<StoreItem[]>{
    return apiRequest<StoreItem[]>("/Wishlist")
}

export function addToWishlist(
    game: AddToStoreRequest
):Promise<void>{
    return apiRequest<void>("/Wishlist",{
        method: "POST",
        body: JSON.stringify(game),
    });
}

export function removeFromWishlist(gameId: string):Promise<void>{
    return apiRequest<void>(`/Wishlist/${encodeURIComponent(gameId)}`,{
        method: "DELETE",
    });
}

export function getCart():Promise<StoreItem[]>{
    return apiRequest<StoreItem[]>("/Cart");
}

export function addToCart(
    game: AddToStoreRequest
):Promise<void>{
    return apiRequest<void>("/Cart",{
        method: "POST",
        body: JSON.stringify(game),
    });
}

export function removeFromCart(gameId: string): Promise<void>{
    return apiRequest<void>(`/Cart/${encodeURIComponent(gameId)}`,{
        method:"DELETE",
    });
}

export function clearCart():Promise<void>{
    return apiRequest<void>("/Cart/clear",{
        method: "DELETE",
    });
}