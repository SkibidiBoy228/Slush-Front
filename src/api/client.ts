const API_URL = import.meta.env.VITE_API_URL;

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

    const decodedPayload = JSON.parse(
      decodeURIComponent(
        atob(payload)
          .split("")
          .map(
            (char) =>
              `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`
          )
          .join("")
      )
    );

    return (
      decodedPayload.unique_name ||
      decodedPayload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
      ] ||
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

export async function apiRequest<T>(
  endPoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();

  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endPoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");

  const data = contentType?.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(
      typeof data === "string"
        ? data
        : data?.message || "Something went wrong"
    );
  }

  return data as T;
}