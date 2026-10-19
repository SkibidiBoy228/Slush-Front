import { apiRequest } from "./client";

export interface PurchaseResult{
    gameId?: string;
    title?: string;
    price?: number;
    newBalance?: number;
    balance?: number;
    currency?: string;
    message?: string;
}

export interface CheckoutResult{
    items?: PurchaseResult[];
    total?: number;
    totalAmount?: number;
    newBalance?: number;
    balance?: number;
    currency?: string;
    message?: string;  
}
export function purchaseGame(
    gameId: string
): Promise<PurchaseResult>{
    return apiRequest<PurchaseResult>(`/api/Purchases/${encodeURIComponent(gameId)}`, {method: "POST"});
}
export function checkoutCart(): Promise<CheckoutResult>{
    return apiRequest<CheckoutResult>(`/api/Purchases/checkout`, {method: "POST"})
}