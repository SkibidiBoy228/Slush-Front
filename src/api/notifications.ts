import { apiRequest } from "./client";
import type {
    NotificationsResponse,
    UnreadCountResponse
} from "../types/notifications";

export async function getNotifications(page = 1, pageSize  = 10) : Promise<NotificationsResponse> {
    return apiRequest<NotificationsResponse>(`/api/UserNotifications?page=${page}&pageSize=${pageSize}`, {
        method: "GET",
    })
}

export async function getUnreadNotificationsCount() : Promise<number> {
    const response = await apiRequest<UnreadCountResponse>(
        "/api/UserNotifications/unread-count",
        {
            method: "GET",
        }
    );
    return response.count;
}
export async function markNotificationAsRead(notificationId: string) : Promise<void>{
    await apiRequest(`/api/UserNotifications/${encodeURIComponent(notificationId)}/read`,{
        method: "PUT",
    })
}
export async function markAllNotificationsAsRead():Promise<void> {
    await apiRequest("/api/UserNotifications/read-all",{
        method: "PUT",
    })
}