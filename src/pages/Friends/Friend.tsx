
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

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

function getDateLocale(language: string) {
  const locales: Record<string, string> = {
    uk: "uk-UA",
    en: "en-US",
    sk: "sk-SK",
    ru: "ru-RU",
  };

  return locales[language.split("-")[0]] ?? "uk-UA";
}

function formatActivityDate(value: string, locale: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
  });
}

function getActivityText(
  activity: FriendActivity,
  t: (key: string) => string,
) {
  switch (activity.activityType) {
    case "GamePurchased":
      return t("friends.activityGamePurchased");

    case "WishlistAdded":
      return t("friends.activityWishlistAdded");

    case "ScreenshotPublished":
      return t("friends.activityScreenshotPublished");

    default:
      return t("friends.activityDefault");
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
  const { t, i18n } = useTranslation();
  const dateLocale = getDateLocale(i18n.language);

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
    [friends],
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
      console.error("Failed to load friends page:", requestError);

      setError(
        requestError instanceof Error
          ? requestError.message
          : t("friends.loadError"),
      );
    } finally {
      setLoading(false);
    }
  }, [loadFriends, loadRequests, loadBlockedUsers, loadActivities, t]);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  // Обработка обновлений присутствия через SignalR.
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
      }, currentFriends),
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
          gameId || undefined,
        );

        setSearchResults(result ?? []);
      } catch (requestError) {
        console.error("Search failed:", requestError);
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
      console.error("Failed to load tab:", requestError);

      setError(
        requestError instanceof Error
          ? requestError.message
          : t("friends.loadError"),
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
        current.filter((item) => item.id !== request.id),
      );

      await loadFriends("all");
      setSuccessMessage(t("friends.requestAccepted"));
    } catch (requestError) {
      console.error("Failed to accept request:", requestError);
      setError(t("friends.acceptError"));
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
        current.filter((item) => item.id !== request.id),
      );

      setSuccessMessage(t("friends.requestRejected"));
    } catch (requestError) {
      console.error("Failed to reject request:", requestError);
      setError(t("friends.rejectError"));
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
        current.filter((item) => item.id !== request.id),
      );

      setSuccessMessage(t("friends.requestCancelled"));
    } catch (requestError) {
      console.error("Failed to cancel request:", requestError);
      setError(t("friends.cancelError"));
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleRemove(friend: FriendUser) {
    const confirmed = window.confirm(
      t("friends.confirmRemove", { username: friend.username }),
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(friend.userId);
      setError("");

      await removeFriend(friend.userId);

      setFriends((current) =>
        current.filter((item) => item.userId !== friend.userId),
      );

      setSuccessMessage(t("friends.friendRemoved"));
    } catch (requestError) {
      console.error("Failed to remove friend:", requestError);
      setError(t("friends.removeError"));
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleBlock(friend: FriendUser) {
    const confirmed = window.confirm(
      t("friends.confirmBlock", { username: friend.username }),
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(friend.userId);
      setError("");

      await blockUser(friend.userId);

      setFriends((current) =>
        current.filter((item) => item.userId !== friend.userId),
      );

      await loadBlockedUsers();
      setSuccessMessage(t("friends.userBlocked"));
    } catch (requestError) {
      console.error("Failed to block user:", requestError);
      setError(t("friends.blockError"));
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
        current.filter((item) => item.userId !== user.userId),
      );

      setSuccessMessage(t("friends.userUnblocked"));
    } catch (requestError) {
      console.error("Failed to unblock user:", requestError);
      setError(t("friends.unblockError"));
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
            : item,
        ),
      );

      setSuccessMessage(t("friends.requestSent"));
    } catch (requestError) {
      console.error("Failed to send request:", requestError);
      setError(t("friends.sendRequestError"));
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
      <main className="friends-page-container">
        <div className="friends-topbar">
          <nav className="friends-tabs">
            <button
              type="button"
              className={activeTab === "all" ? "active" : ""}
              onClick={() => void handleTabChange("all")}
            >
              {t("friends.allFriends")}
              <span>{friends.length}</span>
            </button>

            <button
              type="button"
              className={activeTab === "online" ? "active" : ""}
              onClick={() => void handleTabChange("online")}
            >
              {t("friends.online")}
              <span>{onlineFriends.length}</span>
            </button>

            <button
              type="button"
              className={activeTab === "blocked" ? "active" : ""}
              onClick={() => void handleTabChange("blocked")}
            >
              {t("friends.blocked")}
              <span>{blockedUsers.length}</span>
            </button>

            <button
              type="button"
              className={activeTab === "requests" ? "active" : ""}
              onClick={() => void handleTabChange("requests")}
            >
              {t("friends.currentRequests")}
              {incomingRequests.length > 0 && (
                <span className="friends-request-count">
                  {incomingRequests.length}
                </span>
              )}
            </button>
          </nav>

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
            {t("friends.addFriend")}
          </button>
        </div>

        {hasSearch && (
          <section className="friends-search-results">
            <div className="friends-content-heading">
              <h2>{t("friends.searchResults")}</h2>
              <span>
                {searchLoading ? t("friends.searching") : searchResults.length}
              </span>
            </div>

            {searchLoading ? (
              <div className="friends-empty">
                {t("friends.searchingUsers")}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="friends-empty">
                {t("friends.usersNotFound")}
              </div>
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
                            ? t("friends.alreadyFriends")
                            : user.friendStatus === "PendingSent"
                              ? t("friends.requestAlreadySent")
                              : user.friendStatus === "PendingReceived"
                                ? t("friends.incomingRequest")
                                : t("friends.notFriends")}
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
                        {actionLoadingId === user.userId
                          ? "..."
                          : t("friends.add")}
                      </button>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        <div className="friends-layout">
          <section className="friends-main-column">
            <div className="friends-search-row">
              <FriendSearch
                value={searchQuery}
                onChange={setSearchQuery}
                gameId={searchGameId}
                onGameIdChange={setSearchGameId}
              />
            </div>

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
                  aria-label={t("friends.closeMessage")}
                >
                  ×
                </button>
              </div>
            )}

            {loading ? (
              <div className="friends-loading">
                {t("friends.loading")}
              </div>
            ) : activeTab === "requests" ? (
              <div className="friends-requests">
                <section className="friends-request-section">
                  <div className="friends-content-heading">
                    <h2>{t("friends.incomingRequests")}</h2>
                    <span>{incomingRequests.length}</span>
                  </div>

                  {incomingRequests.length === 0 ? (
                    <div className="friends-empty">
                      {t("friends.noIncomingRequests")}
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
                    <h2>{t("friends.outgoingRequests")}</h2>
                    <span>{outgoingRequests.length}</span>
                  </div>

                  {outgoingRequests.length === 0 ? (
                    <div className="friends-empty">
                      {t("friends.noOutgoingRequests")}
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
                  <h2>{t("friends.blockedUsers")}</h2>
                  <span>{blockedUsers.length}</span>
                </div>

                {blockedUsers.length === 0 ? (
                  <div className="friends-empty">
                    {t("friends.noBlockedUsers")}
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
                              {t("friends.blockedAt", {
                                date: formatActivityDate(user.blockedAt, dateLocale),
                              })}
                            </span>
                          </span>
                        </button>

                        <button
                          type="button"
                          className="friends-unblock-button"
                          disabled={actionLoadingId === user.userId}
                          onClick={() => void handleUnblock(user)}
                        >
                          {t("friends.unblock")}
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
                    {activeTab === "online"
                      ? t("friends.onlineFriends")
                      : t("friends.allFriends")}
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
                      ? t("friends.noFriendsOnline")
                      : t("friends.noFriends")}
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
                      ),
                    )}
                  </div>
                )}
              </section>
            )}
          </section>

          <aside className="friends-activity">
            <div className="friends-activity-heading">
              <h2>{t("friends.friendsActivity")}</h2>
            </div>

            {activities.length === 0 ? (
              <div className="friends-activity-empty">
                {t("friends.noRecentActivity")}
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
                          {getActivityText(activity, t)}
                        </span>
                      </div>
                    </div>

                    {activity.activityType === "ScreenshotPublished" &&
                      activity.mediaUrl && (
                        <button
                          type="button"
                          className="friends-activity-image-button"
                          onClick={() =>
                            window.open(
                              activity.mediaUrl!,
                              "_blank",
                              "noopener,noreferrer",
                            )
                          }
                        >
                          <img
                            src={activity.mediaUrl}
                            alt={t("friends.gameScreenshot", {
                              title: activity.gameTitle ?? "",
                            })}
                          />
                        </button>
                      )}

                    {activity.gameTitle && (
                      <div className="friends-activity-game">
                        <strong>{activity.gameTitle}</strong>
                        <span>
                          {formatActivityDate(activity.createdAt, dateLocale)}
                        </span>
                      </div>
                    )}

                    {!activity.gameTitle && (
                      <div className="friends-activity-game">
                        <span>
                          {formatActivityDate(activity.createdAt, dateLocale)}
                        </span>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Friends;
