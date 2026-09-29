import { apiRequest } from "./client";

import type {
    ProfileSettings,
    UpdateProfileSettingsRequest,
    NotificationSettings,
    ChangePasswordRequest,
    DeleteAccountRequest,
    WalletBalance,
    DepositRequest,
    DepositResponse,
    WalletTransactionResponse,
} from "../types/settings";

export async function getProfileSettings(): Promise<ProfileSettings> {
  return apiRequest<ProfileSettings>("/api/Settings/profile", {
    method: "GET",
  });
}

export async function updateProfileSettings(
  data: UpdateProfileSettingsRequest
): Promise<void> {
  await apiRequest("/api/Settings/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
export async function getNotificationSettings() : Promise<NotificationSettings> {
    return apiRequest<NotificationSettings>(
        "/api/Settings/notification", {
            method: "GET",
        }
    );
}
export async function updateNotificationSettings(
    data : NotificationSettings
) : Promise<void>{
    await apiRequest("/api/Settings/notifications", {
        method: "PUT",
        body: JSON.stringify(data),
    });
}
export async function changePassword(data:ChangePasswordRequest) : Promise<void> {
    await apiRequest("/api/Auth/change-password", {
        method: "POST",
        body: JSON.stringify(data),
    });
}
export async function deleteAccount(data:DeleteAccountRequest): Promise<void> {
    await apiRequest("/api/Auth/account",{
        method: "DELETE",
        body: JSON.stringify(data),
    });
}
export async function getWalletBalance(): Promise<WalletBalance> {
    return apiRequest<WalletBalance>("/api/Wallet", {
        method: "GET",
    });
}
export async function depositToWallet(data: DepositRequest): Promise<DepositResponse> {
    return apiRequest<DepositResponse>("/api/Wallet/deposit", {
        method: "POST",
        body: JSON.stringify(data),
    });
}
export async function getWalletTransactions(page = 1, pageSize = 10) : Promise<WalletTransactionResponse> {
    return apiRequest<WalletTransactionResponse>(`/api/Wallet/transactions?page=1${page}&pageSize=${pageSize}`,{
        method: "GET",
    })
}