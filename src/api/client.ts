function getTokenStorage(): Storage | null {
  if (localStorage.getItem("refreshToken")) {
    return localStorage;
  }

  if (sessionStorage.getItem("refreshToken")) {
    return sessionStorage;
  }

  if (localStorage.getItem("accessToken")) {
    return localStorage;
  }

  if (sessionStorage.getItem("accessToken")) {
    return sessionStorage;
  }

  return null;
}

export function getAccessToken(): string | null {
  return (
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken")
  );
}

export function getRefreshToken(): string | null {
  return (
    localStorage.getItem("refreshToken") ||
    sessionStorage.getItem("refreshToken")
  );
}

export function getCurrentUsername(): string | null {
  const token = getAccessToken();

  if (!token) return null;

  try {
    const payload = token.split(".")[1];

    if (!payload) return null;

    const base64 = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payload.length / 4) * 4, "=");

    const decodedPayload = JSON.parse(
      decodeURIComponent(
        Array.from(atob(base64))
          .map(
            (char) =>
              `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`
          )
          .join("")
      )
    );

    return (
      decodedPayload.unique_name ||
      decodedPayload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
      ] ||
      decodedPayload.name ||
      null
    );
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

export function logout(): void {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");

  window.dispatchEvent(new Event("auth-changed"));
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/Auth/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refreshToken,
          }),
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      const newAccessToken = data.accessToken;
      const newRefreshToken = data.refreshToken;

      if (!newAccessToken || !newRefreshToken) {
        return null;
      }

      const storage = getTokenStorage();

      if (!storage) {
        return null;
      }

      storage.setItem("accessToken", newAccessToken);
      storage.setItem("refreshToken", newRefreshToken);

      window.dispatchEvent(new Event("auth-changed"));

      return newAccessToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let token = getAccessToken();

  const makeRequest = async (accessToken: string | null) => {
    const headers = new Headers(options.headers);

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    if (!(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    return fetch(
      `${import.meta.env.VITE_API_URL}${endpoint}`,
      {
        ...options,
        headers,
      }
    );
  };

  let response = await makeRequest(token);

  /*
   * Если access token истёк:
   *
   * 1. Не пытаемся refresh для Auth endpoints.
   * 2. Берём refresh token.
   * 3. Получаем новые токены.
   * 4. Повторяем исходный запрос.
   */
  if (
    response.status === 401 &&
    token &&
    !endpoint.startsWith("/api/Auth/")
  ) {
    const newAccessToken = await refreshAccessToken();

    if (newAccessToken) {
      token = newAccessToken;

      response = await makeRequest(token);
    } else {
      logout();
    }
  }

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText || `Ошибка запроса: ${response.status}`
    );
  }

  const responseText = await response.text();

  if (!responseText.trim()) {
    return undefined as T;
  }

  try {
    return JSON.parse(responseText) as T;
  } catch {
    return responseText as T;
  }
}