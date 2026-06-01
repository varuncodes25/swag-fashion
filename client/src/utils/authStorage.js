/**
 * Normalize login/signup API payloads (encrypted ApiResponse, Google flat JSON, OAuth callback).
 */
export function extractAuthFromResponse(payload) {
  if (!payload) {
    return { token: "", refreshToken: "", user: null, message: "" };
  }

  // Flat shape: { token, refreshToken, user } (Google One Tap, AuthCallback)
  if (payload.token && (payload.user || payload.refreshToken !== undefined)) {
    return {
      token: payload.token,
      refreshToken: payload.refreshToken || "",
      user: payload.user || null,
      message: payload.message || "",
    };
  }

  // ApiResponse: { statusCode, data: { token, refreshToken, user }, message }
  let inner = payload.data;

  if (typeof inner === "string") {
    return { token: "", refreshToken: "", user: null, message: payload.message || "" };
  }

  if (inner?.data && typeof inner.data === "object" && (inner.data.token || inner.data.user)) {
    inner = inner.data;
  }

  const data = inner && typeof inner === "object" ? inner : payload;

  return {
    token: data.token || data.accessToken || "",
    refreshToken: data.refreshToken || "",
    user: data.user || null,
    message: payload.message || data.message || "",
  };
}

export function saveAuthToLocalStorage({ token, refreshToken, user, role }) {
  if (token) {
    localStorage.setItem("token", token);
  }
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }
  if (role) {
    localStorage.setItem("role", role);
  }
}

export function clearAuthFromLocalStorage() {
  localStorage.removeItem("role");
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
}

export function getStoredToken() {
  const token = localStorage.getItem("token");
  return token && token !== "null" && token !== "undefined" ? token : "";
}
