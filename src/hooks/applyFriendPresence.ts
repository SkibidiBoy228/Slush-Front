import type { FriendUser } from "../types/friends";

export interface FriendPresenceEvent{
    userId: string;
    username: string;
    avatarUrl: string | null;
    eventType: "Online" | "Offline" | "InGame" | "StoppedPlaying";
    gameId: string | null;
    gameTitle: string | null;
    statusText: string;
    timestamp: string;
}

export function applyFriendPresence(
    friends: FriendUser[],
    event: FriendPresenceEvent,
) : FriendUser[]{
    return friends.map((friend) => {
        if(friend.userId !== event.userId){
            return friend;
        }
        switch (event.eventType){
            case "Online":
                return{
                    ...friend,
                    isOnline: true,
                    lastSeenAt: null,
                    currentGameId:null,
                    currentGameTitle: null,
                };
            case "Offline":
                return{
                    ...friend,
                    isOnline: false,
                    lastSeenAt: event.timestamp,
                    currentGameId: null,
                    currentGameTitle: null,
                };
            case "InGame":
                return{
                    ...friend,
                    isOnline: true,
                    lastSeenAt: null,
                    currentGameId: event.gameId,
                    currentGameTitle: event.gameTitle
                };
            case "StoppedPlaying":
                return{
                    ...friend,
                    isOnline: true,
                    lastSeenAt: null,
                    currentGameId: null,
                    currentGameTitle: null,
                };
            default:
                return friend;
        }
    });
}