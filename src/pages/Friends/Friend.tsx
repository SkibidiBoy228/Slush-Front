import { useEffect, useState } from "react";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import FriendCard from "../../components/Friends/FriendCard/FriendCard";
import FriendSearch from "../../components/Friends/FriendSearch/FriendSearch";
import FriendRequestCard from "../../components/Friends/FriendRequestCard/FriendRequestCard";

import {
  getFriends,
  getIncomingFriendRequests,
  getOutgoingFriendRequests,
  searchUsers,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
} from "../../api/friends";

import type {
  FriendUser,
  FriendRequest,
  UserSearchResult,
} from "../../types/friends";

import "./Friends.css";

type FriendsTab = "all" | "online" | "requests";

function Friends() {
  const [activeTab, setActiveTab] = useState<FriendsTab>("all");

  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>(
    []
  );
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>(
    []
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFriends();
  }, []);

  useEffect(() => {
    const query = searchQuery.trim();

    if (!query) {
      setSearchResults([]);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await searchUsers(query, 1, 20);
        setSearchResults(response.items ?? []);
      } catch (requestError) {
        console.error("Не вдалося виконати пошук:", requestError);
        setSearchResults([]);
      }
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  async function loadFriends() {
    try {
      setLoading(true);
      setError("");

      const response = await getFriends(1, 100);

      setFriends(response.items ?? []);
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не вдалося завантажити друзів"
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadRequests() {
    try {
      setLoading(true);
      setError("");

      const [incoming, outgoing] = await Promise.all([
        getIncomingFriendRequests(1, 100),
        getOutgoingFriendRequests(1, 100),
      ]);

      setIncomingRequests(incoming.items ?? []);
      setOutgoingRequests(outgoing.items ?? []);
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не вдалося завантажити заявки"
      );
    } finally {
      setLoading(false);
    }
  }

  function handleTabChange(tab: FriendsTab) {
    setActiveTab(tab);

    if (tab === "all" || tab === "online") {
      loadFriends();
    }

    if (tab === "requests") {
      loadRequests();
    }
  }

  async function handleAccept(request: FriendRequest) {
    try {
      setActionLoadingId(request.id);

      await acceptFriendRequest(request.id);

      setIncomingRequests((current) =>
        current.filter((item) => item.id !== request.id)
      );

      await loadFriends();
    } catch (requestError) {
      console.error("Не вдалося прийняти заявку:", requestError);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleReject(request: FriendRequest) {
    try {
      setActionLoadingId(request.id);

      await rejectFriendRequest(request.id);

      setIncomingRequests((current) =>
        current.filter((item) => item.id !== request.id)
      );
    } catch (requestError) {
      console.error("Не вдалося відхилити заявку:", requestError);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleCancel(request: FriendRequest) {
    try {
      setActionLoadingId(request.id);

      await cancelFriendRequest(request.id);

      setOutgoingRequests((current) =>
        current.filter((item) => item.id !== request.id)
      );
    } catch (requestError) {
      console.error("Не вдалося скасувати заявку:", requestError);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleRemove(friend: FriendUser) {
    try {
      setActionLoadingId(friend.userId);

      await removeFriend(friend.userId);

      setFriends((current) =>
        current.filter((item) => item.userId !== friend.userId)
      );
    } catch (requestError) {
      console.error("Не вдалося видалити друга:", requestError);
    } finally {
      setActionLoadingId(null);
    }
  }

  function openProfile(username: string) {
    window.location.href = `/profile/${encodeURIComponent(username)}`;
  }

  const onlineFriends = friends.filter((friend) => friend.isOnline);

  return (
    <div className="friends-page">
      <Header />

      <main className="friends-page-container">
        <div className="friends-page-heading">
          <div>
            <h1>Друзі</h1>
            <p>Керуйте друзями та заявками</p>
          </div>
        </div>

        <FriendSearch
          value={searchQuery}
          onChange={setSearchQuery}
        />

        {searchQuery.trim() && (
          <section className="friends-search-results">
            <div className="friends-content-heading">
              <h2>Результати пошуку</h2>
              <span>{searchResults.length}</span>
            </div>

            {searchResults.length === 0 ? (
              <p className="friends-empty">
                Користувачів не знайдено
              </p>
            ) : (
              <div className="friends-grid">
                {searchResults.map((user) => (
                  <article
                    className="friends-search-result"
                    key={user.userId}
                  >
                    <button
                      type="button"
                      className="friends-search-user"
                      onClick={() => openProfile(user.username)}
                    >
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.username}
                        />
                      ) : (
                        <div className="friends-search-avatar-placeholder">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <strong>{user.username}</strong>

                        <span>
                          {user.friendStatus === "Friends"
                            ? "В друзі"
                            : user.friendStatus === "PendingSent"
                              ? "Запит надіслано"
                              : user.friendStatus === "PendingReceived"
                                ? "Є вхідний запит"
                                : "Не в друзях"}
                        </span>
                      </div>
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        <div className="friends-tabs">
          <button
            type="button"
            className={activeTab === "all" ? "active" : ""}
            onClick={() => handleTabChange("all")}
          >
            Усі друзі
            <span>{friends.length}</span>
          </button>

          <button
            type="button"
            className={activeTab === "online" ? "active" : ""}
            onClick={() => handleTabChange("online")}
          >
            Онлайн
            <span>{onlineFriends.length}</span>
          </button>

          <button
            type="button"
            className={activeTab === "requests" ? "active" : ""}
            onClick={() => handleTabChange("requests")}
          >
            Заявки

            {incomingRequests.length > 0 && (
              <span className="friends-request-count">
                {incomingRequests.length}
              </span>
            )}
          </button>
        </div>

        {error && (
          <div className="friends-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="friends-loading">
            Завантаження...
          </div>
        ) : activeTab === "requests" ? (
          <div className="friends-requests">
            <section className="friends-request-section">
              <div className="friends-content-heading">
                <h2>Вхідні заявки</h2>
                <span>{incomingRequests.length}</span>
              </div>

              {incomingRequests.length === 0 ? (
                <p className="friends-empty">
                  Вхідних заявок немає
                </p>
              ) : (
                <div className="friends-request-list">
                  {incomingRequests.map((request) => (
                    <FriendRequestCard
                      key={request.id}
                      request={request}
                      type="incoming"
                      loading={actionLoadingId === request.id}
                      onAccept={handleAccept}
                      onReject={handleReject}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="friends-request-section">
              <div className="friends-content-heading">
                <h2>Вихідні заявки</h2>
                <span>{outgoingRequests.length}</span>
              </div>

              {outgoingRequests.length === 0 ? (
                <p className="friends-empty">
                  Вихідних заявок немає
                </p>
              ) : (
                <div className="friends-request-list">
                  {outgoingRequests.map((request) => (
                    <FriendRequestCard
                      key={request.id}
                      request={request}
                      type="outgoing"
                      loading={actionLoadingId === request.id}
                      onCancel={handleCancel}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          <section className="friends-content-section">
            <div className="friends-content-heading">
              <h2>
                {activeTab === "online"
                  ? "Друзі онлайн"
                  : "Усі друзі"}
              </h2>

              <span>
                {activeTab === "online"
                  ? onlineFriends.length
                  : friends.length}
              </span>
            </div>

            {(
              activeTab === "online"
                ? onlineFriends
                : friends
            ).length === 0 ? (
              <p className="friends-empty">
                {activeTab === "online"
                  ? "Зараз немає друзів онлайн"
                  : "Друзів поки немає"}
              </p>
            ) : (
              <div className="friends-grid">
                {(activeTab === "online"
                  ? onlineFriends
                  : friends
                ).map((friend) => (
                  <FriendCard
                    key={friend.userId}
                    friend={friend}
                    showRemoveButton
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Friends;