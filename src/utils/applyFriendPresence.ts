import type { FriendUser } from "../types/friends";
import type { FriendPresenceToast } from "../types/friendPresence";

export function applyFriendPresence(
    friends: FriendUser[],
    event: FriendPresenceToast
) : FriendUser[]{
    return friends.map((friend)=>{
        if(friend.userId !== event.userId){
            return friend;
        }
        const isPlaying = event.eventType === "InGame";

        return{
            ...friend,
            isOnline: true,
            currentGameId: isPlaying ? event.gameId : null,
            currentGameTitle: isPlaying ? event.gameTitle : null,
        }
    })
}