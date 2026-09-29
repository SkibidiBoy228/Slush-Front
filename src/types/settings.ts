
export interface ProfileSettings{
    username: string;
    email: string;
    bio: string;
    language: string;
    avatarUrl: string;
    coverUrl: string;
}

export interface UpdateProfileSettingsRequest{
    username: string;
    bio: string;
    email: string;
    language: string;
}

export interface NotificationSettings{
    bigSale: boolean;
    wishlistDiscount: boolean;
    profileComment: boolean;
    friendRequest: boolean;
    friendRequestAccepted: boolean;
    friendRequestRejected: boolean;
    chatMessageNotification: boolean;
    chatMessageSound: boolean;
}

export interface ChangePasswordRequest{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface DeleteAccountRequest {
    password: string;
    confirmPassword: string;
}

export interface WalletBalance{
    balance: number;
}

export interface DepositRequest{
    amount: number;
}

export interface DepositResponse{
    message: string;
    newBalance: number;
}

export interface WalletTransaction {
    id: string;
    amount: number;
    title: string;
    type: string;
    createdAt: string;
}

export interface WalletTransactionResponse{
    items: WalletTransaction[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages?: number;
}