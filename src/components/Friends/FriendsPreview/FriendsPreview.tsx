import { useEffect, useState } from "react";
import { getFriends } from "../../../api/friends";
import type { FriendUser } from "../../../types/friends";
import "./FriendsPreview.css";
interface FriendsPreviewProps {
    username: string;
}

function FriendsPreview({username} : FriendsPreviewProps){
    const [friends, setFriends] = useState<FriendUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        let cancelled = false;
        async function loadFriends() {
            try{
                setLoading(true);
                const response = await getFriends(1, 6);
                if(!cancelled){
                    setFriends(response.items);
                }
            }catch (error){
                console.error("Не вдалося завантажити друзів", error);
                if(!cancelled){
                    setFriends([]);
                }
            }finally{
                if(!cancelled){
                    setLoading(false);
                }
            }
        }
        loadFriends();
        return()=>{
            cancelled = true;
        };
    }, [username]);
    function openProfile(friendUsername : string){
        window.location.href = `/profile/${encodeURIComponent(friendUsername)}`;
    }
    function openFriendsPage(){
        window.location.href = `/friends`
    }
    return(
        <section className="friends-preview">
            <div className="friends-preview-header">
                <h2>Друзі</h2>
                <button type="button"
                    className="friends-preview-all"
                    onClick={openFriendsPage}
                >
                    Всі
                </button>
            </div>
            {loading ? (
                <div className="friends-preview-loading">
                    Завантаження...
                </div>
            ): friends.length === 0 ?(
                <div className="friends-preview-empty">
                    У користовуча поки немає друзів
                </div>
            ) : (
                <div className="friends-preview-grid">
                    {friends.map((friend)=>(
                        <button key = {friend.userId}
                            type="button"
                            className="friend-preview-card"
                            onClick={()=>openProfile(friend.username)}
                            >
                                <div className="friends-preview-avatar-wrapper">
                                    {friend.avatarUrl ? (
                                        <img src = {friend.avatarUrl}
                                        alt={friend.username}
                                        className="friend-preview-avatar"
                                        />
                                    ) : (
                                        <div className="friend-preview-avatar friend-preview-avatar-placeholder">
                                            {friend.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className={`friend-preview-status ${friend.isOnline ? "online" : "offline"}`}></span>
                                </div>
                                <span className="friend-preview-name">{friend.username}</span>
                            </button>
                    ))}
                </div>
            )}
        </section>
    );
}

export default FriendsPreview;