export interface Notification {
    id: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

export interface NotificationsResponse{
    items: Notification[];
    totalCount: number;
    page: number;
    pageSize: number;
}

export interface UnreadCountResponse{
    count: number;
}