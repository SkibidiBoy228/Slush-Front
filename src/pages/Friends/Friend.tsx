import { useCallback, useEffect, useMemo, useState } from "react";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import FriendCard from "../../components/Friends/FriendCard/FriendCard";
import FriendSearch from "../../components/Friends/FriendSearch/FriendSearch";
import FriendRequestCard from "../../components/Friends/FriendRequestCard/FriendRequestCard";

import { useFriendPresence } from "../../hooks/useFriendPresence";

import {
  getFriends,
  getFriendRequests,
  getBlockedUsers,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
  blockUser,
  unblockUser,
  getFriendsActivity,
} from "../../api/friends";

import type {
  FriendUser,
  FriendRequest,
  BlockedUser,
  UserSearchResult,
  FriendActivity,
} from "../../types/friends";

import "./Friends.css";

type FriendsTab = "all" | "online" | "blocked" | "requests";

function formatActivityDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
  });
}

function getActivityText(activity: FriendActivity) {
  switch (activity.activityType) {
    case "GamePurchased":
      return "придбав гру";

    case "WishlistAdded":
      return "додав гру до списку бажань";

    case "ScreenshotPublished":
      return "опублікував скриншот";

    default:
      return "здійснив дію";
  }
}

function getActivityIcon(activity: FriendActivity) {
  switch (activity.activityType) {
    case "GamePurchased":
      return "🛒";

    case "WishlistAdded":
      return "♡";

    case "ScreenshotPublished":
      return "▧";

    default:
      return "•";
  }
}

function Friends() {
  const [activeTab, setActiveTab] = useState<FriendsTab>("all");

  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [activities, setActivities] = useState<FriendActivity[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchGameId, setSearchGameId] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { events } = useFriendPresence();

  const onlineFriends = useMemo(
    () => friends.filter((friend) => friend.isOnline),
    [friends]
  );

  const loadFriends = useCallback(async (filter: "all" | "online" = "all") => {
    const result = await getFriends(filter);
    setFriends(result);
  }, []);

  const loadRequests = useCallback(async () => {
    const result = await getFriendRequests();

    setIncomingRequests(result.incoming ?? []);
    setOutgoingRequests(result.outgoing ?? []);
  }, []);

  const loadBlockedUsers = useCallback(async () => {
    const result = await getBlockedUsers();
    setBlockedUsers(result);
  }, []);

  const loadActivities = useCallback(async () => {
    const result = await getFriendsActivity(1, 20);
    setActivities(result.items ?? []);
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        loadFriends("all"),
        loadRequests(),
        loadBlockedUsers(),
        loadActivities(),
      ]);
    } catch (requestError) {
      console.error("Не вдалося завантажити сторінку друзів:", requestError);

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не вдалося завантажити дані"
      );
    } finally {
      setLoading(false);
    }
  }, [loadFriends, loadRequests, loadBlockedUsers, loadActivities]);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  // Обробка оновлень присутності через SignalR.
  useEffect(() => {
    if (events.length === 0) return;

    setFriends((currentFriends) =>
      events.reduce((current, event) => {
        return current.map((friend) => {
          if (friend.userId !== event.userId) {
            return friend;
          }

          switch (event.eventType) {
            case "Online":
              return {
                ...friend,
                isOnline: true,
                lastSeenAt: null,
              };

            case "Offline":
              return {
                ...friend,
                isOnline: false,
                lastSeenAt: event.timestamp ?? friend.lastSeenAt,
                currentGameId: null,
                currentGameTitle: null,
              };

            case "InGame":
              return {
                ...friend,
                isOnline: true,
                lastSeenAt: null,
                currentGameId: event.gameId ?? null,
                currentGameTitle: event.gameTitle ?? null,
              };

            case "StoppedPlaying":
              return {
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
      }, currentFriends)
    );
  }, [events]);

  // Поиск по никнейму или ID игры.
  useEffect(() => {
    const query = searchQuery.trim();
    const gameId = searchGameId.trim();

    if (!query && !gameId) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        setSearchLoading(true);

        const result = await searchUsers(
          query || undefined,
          gameId || undefined
        );

        setSearchResults(result ?? []);
      } catch (requestError) {
        console.error("Не вдалося виконати пошук:", requestError);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery, searchGameId]);

  async function handleTabChange(tab: FriendsTab) {
    setActiveTab(tab);

    try {
      setLoading(true);
      setError("");

      if (tab === "all") {
        await loadFriends("all");
      } else if (tab === "online") {
        await loadFriends("online");
      } else if (tab === "blocked") {
        await loadBlockedUsers();
      } else if (tab === "requests") {
        await loadRequests();
      }
    } catch (requestError) {
      console.error("Не вдалося завантажити вкладку:", requestError);

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не вдалося завантажити дані"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(request: FriendRequest) {
    try {
      setActionLoadingId(request.id);
      setError("");

      await acceptFriendRequest(request.id);

      setIncomingRequests((current) =>
        current.filter((item) => item.id !== request.id)
      );

      await loadFriends("all");
      setSuccessMessage("Заявку прийнято");
    } catch (requestError) {
      console.error("Не вдалося прийняти заявку:", requestError);
      setError("Не вдалося прийняти заявку");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleReject(request: FriendRequest) {
    try {
      setActionLoadingId(request.id);
      setError("");

      await rejectFriendRequest(request.id);

      setIncomingRequests((current) =>
        current.filter((item) => item.id !== request.id)
      );

      setSuccessMessage("Заявку відхилено");
    } catch (requestError) {
      console.error("Не вдалося відхилити заявку:", requestError);
      setError("Не вдалося відхилити заявку");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleCancel(request: FriendRequest) {
    try {
      setActionLoadingId(request.id);
      setError("");

      await cancelFriendRequest(request.id);

      setOutgoingRequests((current) =>
        current.filter((item) => item.id !== request.id)
      );

      setSuccessMessage("Запит скасовано");
    } catch (requestError) {
      console.error("Не вдалося скасувати заявку:", requestError);
      setError("Не вдалося скасувати заявку");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleRemove(friend: FriendUser) {
    const confirmed = window.confirm(
      `Видалити ${friend.username} зі списку друзів?`
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(friend.userId);
      setError("");

      await removeFriend(friend.userId);

      setFriends((current) =>
        current.filter((item) => item.userId !== friend.userId)
      );

      setSuccessMessage("Користувача видалено з друзів");
    } catch (requestError) {
      console.error("Не вдалося видалити друга:", requestError);
      setError("Не вдалося видалити друга");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleBlock(friend: FriendUser) {
    const confirmed = window.confirm(
      `Заблокувати користувача ${friend.username}?`
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(friend.userId);
      setError("");

      await blockUser(friend.userId);

      setFriends((current) =>
        current.filter((item) => item.userId !== friend.userId)
      );

      await loadBlockedUsers();
      setSuccessMessage("Користувача заблоковано");
    } catch (requestError) {
      console.error("Не вдалося заблокувати користувача:", requestError);
      setError("Не вдалося заблокувати користувача");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleUnblock(user: BlockedUser) {
    try {
      setActionLoadingId(user.userId);
      setError("");

      await unblockUser(user.userId);

      setBlockedUsers((current) =>
        current.filter((item) => item.userId !== user.userId)
      );

      setSuccessMessage("Користувача розблоковано");
    } catch (requestError) {
      console.error("Не вдалося розблокувати користувача:", requestError);
      setError("Не вдалося розблокувати користувача");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleSendRequest(user: UserSearchResult) {
    try {
      setActionLoadingId(user.userId);
      setError("");

      await sendFriendRequest(user.userId);

      setSearchResults((current) =>
        current.map((item) =>
          item.userId === user.userId
            ? { ...item, friendStatus: "PendingSent" }
            : item
        )
      );

      setSuccessMessage("Заявку надіслано");
    } catch (requestError) {
      console.error("Не вдалося надіслати заявку:", requestError);
      setError("Не вдалося надіслати заявку");
    } finally {
      setActionLoadingId(null);
    }
  }

  function openProfile(username: string) {
    window.location.href = `/profile/${encodeURIComponent(username)}`;
  }

  const hasSearch = Boolean(searchQuery.trim() || searchGameId.trim());

  return (
    <div className="friends-page">
      <Header />

      <main className="friends-page-container">
        <div className="friends-page-heading">
          <div>
            <h1>Друзі</h1>
            <p>Знаходьте друзів, спілкуйтеся та стежте за їхньою активністю</p>
          </div>

          <button
            type="button"
            className="friends-add-button"
            onClick={() => {
              document
                .querySelector<HTMLInputElement>(".friend-search input")
                ?.focus();
            }}
          >
            <span>＋</span>
            Додати друга
          </button>
        </div>

        <FriendSearch
          value={searchQuery}
          onChange={setSearchQuery}
          gameId={searchGameId}
          onGameIdChange={setSearchGameId}
        />

        {hasSearch && (
          <section className="friends-search-results">
            <div className="friends-content-heading">
              <h2>Результати пошуку</h2>
              <span>
                {searchLoading ? "Пошук..." : searchResults.length}
              </span>
            </div>

            {searchLoading ? (
              <div className="friends-empty">Шукаємо користувачів...</div>
            ) : searchResults.length === 0 ? (
              <div className="friends-empty">Користувачів не знайдено</div>
            ) : (
              <div className="friends-grid">
                {searchResults.map((user) => (
                  <article className="friends-search-result" key={user.userId}>
                    <button
                      type="button"
                      className="friends-search-user"
                      onClick={() => openProfile(user.username)}
                    >
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.username} />
                      ) : (
                        <span className="friends-search-avatar-placeholder">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      )}

                      <span className="friends-search-user-info">
                        <strong>{user.username}</strong>
                        <span>
                          {user.friendStatus === "Friends"
                            ? "Вже у друзях"
                            : user.friendStatus === "PendingSent"
                              ? "Запит надіслано"
                              : user.friendStatus === "PendingReceived"
                                ? "Є вхідний запит"
                                : "Не у друзях"}
                        </span>
                      </span>
                    </button>

                    {user.friendStatus === "None" ||
                    user.friendStatus === undefined ? (
                      <button
                        type="button"
                        className="friends-search-add"
                        disabled={actionLoadingId === user.userId}
                        onClick={() => void handleSendRequest(user)}
                      >
                        {actionLoadingId === user.userId ? "..." : "Додати"}
                      </button>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        <div className="friends-layout">
          <div className="friends-main-column">
            <nav className="friends-tabs">
              <button
                type="button"
                className={activeTab === "all" ? "active" : ""}
                onClick={() => void handleTabChange("all")}
              >
                Усі друзі
                <span>{friends.length}</span>
              </button>

              <button
                type="button"
                className={activeTab === "online" ? "active" : ""}
                onClick={() => void handleTabChange("online")}
              >
                Онлайн
                <span>{onlineFriends.length}</span>
              </button>

              <button
                type="button"
                className={activeTab === "blocked" ? "active" : ""}
                onClick={() => void handleTabChange("blocked")}
              >
                Заблоковані
                <span>{blockedUsers.length}</span>
              </button>

              <button
                type="button"
                className={activeTab === "requests" ? "active" : ""}
                onClick={() => void handleTabChange("requests")}
              >
                Заявки
                {incomingRequests.length > 0 && (
                  <span className="friends-request-count">
                    {incomingRequests.length}
                  </span>
                )}
              </button>
            </nav>

            {error && (
              <div className="friends-error" role="alert">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="friends-success" role="status">
                {successMessage}
                <button
                  type="button"
                  onClick={() => setSuccessMessage("")}
                  aria-label="Закрити повідомлення"
                >
                  ×
                </button>
              </div>
            )}

            {loading ? (
              <div className="friends-loading">Завантаження...</div>
            ) : activeTab === "requests" ? (
              <div className="friends-requests">
                <section className="friends-request-section">
                  <div className="friends-content-heading">
                    <h2>Вхідні заявки</h2>
                    <span>{incomingRequests.length}</span>
                  </div>

                  {incomingRequests.length === 0 ? (
                    <div className="friends-empty">
                      Вхідних заявок немає
                    </div>
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
                    <div className="friends-empty">
                      Вихідних заявок немає
                    </div>
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
            ) : activeTab === "blocked" ? (
              <section className="friends-content-section">
                <div className="friends-content-heading">
                  <h2>Заблоковані користувачі</h2>
                  <span>{blockedUsers.length}</span>
                </div>

                {blockedUsers.length === 0 ? (
                  <div className="friends-empty">
                    Немає заблокованих користувачів
                  </div>
                ) : (
                  <div className="friends-blocked-list">
                    {blockedUsers.map((user) => (
                      <article
                        className="friends-blocked-card"
                        key={user.userId}
                      >
                        <button
                          type="button"
                          className="friends-search-user"
                          onClick={() => openProfile(user.username)}
                        >
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.username} />
                          ) : (
                            <span className="friends-search-avatar-placeholder">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          )}

                          <span className="friends-search-user-info">
                            <strong>{user.username}</strong>
                            <span>
                              Заблоковано {formatActivityDate(user.blockedAt)}
                            </span>
                          </span>
                        </button>

                        <button
                          type="button"
                          className="friends-unblock-button"
                          disabled={actionLoadingId === user.userId}
                          onClick={() => void handleUnblock(user)}
                        >
                          Розблокувати
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            ) : (
              <section className="friends-content-section">
                <div className="friends-content-heading">
                  <h2>
                    {activeTab === "online" ? "Друзі онлайн" : "Усі друзі"}
                  </h2>

                  <span>
                    {activeTab === "online"
                      ? onlineFriends.length
                      : friends.length}
                  </span>
                </div>

                {(activeTab === "online" ? onlineFriends : friends).length ===
                0 ? (
                  <div className="friends-empty">
                    {activeTab === "online"
                      ? "Зараз немає друзів онлайн"
                      : "Друзів поки немає"}
                  </div>
                ) : (
                  <div className="friends-grid">
                    {(activeTab === "online" ? onlineFriends : friends).map(
                      (friend) => (
                        <FriendCard
                          key={friend.userId}
                          friend={friend}
                          showRemoveButton
                          onClick={() => openProfile(friend.username)}
                          onRemove={handleRemove}
                          onBlock={handleBlock}
                        />
                      )
                    )}
                  </div>
                )}
              </section>
            )}
          </div>

          <aside className="friends-activity">
            <div className="friends-activity-heading">
              <h2>Активність друзів</h2>
            </div>

            {activities.length === 0 ? (
              <div className="friends-activity-empty">
                Поки немає нової активності
              </div>
            ) : (
              <div className="friends-activity-list">
                {activities.map((activity) => (
                  <article
                    className="friends-activity-item"
                    key={activity.id}
                  >
                    <div className="friends-activity-user">
                      {activity.avatarUrl ? (
                        <img
                          src={activity.avatarUrl}
                          alt={activity.username}
                        />
                      ) : (
                        <span className="friends-activity-avatar-placeholder">
                          {activity.username.charAt(0).toUpperCase()}
                        </span>
                      )}

                      <div>
                        <strong>{activity.username}</strong>
                        <span>
                          {getActivityIcon(activity)}{" "}
                          {getActivityText(activity)}
                        </span>
                      </div>
                    </div>

                    <div className="friends-activity-game">
                      <strong>{activity.gameTitle}</strong>
                      <span>{formatActivityDate(activity.createdAt)}</span>
                    </div>

                    {activity.activityType === "ScreenshotPublished" &&
                      activity.mediaUrl && (
                        <button
                          type="button"
                          className="friends-activity-image-button"
                          onClick={() =>
                            window.open(
                              activity.mediaUrl ?? "",
                              "_blank",
                              "noopener,noreferrer"
                            )
                          }
                        >
                          <img
                            src={activity.mediaUrl}
                            alt={`Скриншот гри ${activity.gameTitle}`}
                          />
                        </button>
                      )}
                  </article>
                ))}
              </div>
            )}
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Friends;