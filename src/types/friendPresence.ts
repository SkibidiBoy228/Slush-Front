export type FriendPresenceEventType = 
    | "Online"
    | "InGame"
    | "StoppedPlaying";

export interface FriendPresenceToast{
    userId: string;
    username: string;
    avatarUrl: string;
    eventType: FriendPresenceEventType;
    gameId: string | null;
    gameTitle: string | null;
    gameCoverUrl: string | null;
    statusText: string;
    timestamp: string;
}