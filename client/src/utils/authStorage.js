/**
 * Auth session helpers — tokens live in HttpOnly cookies (not localStorage).
 * Only non-sensitive user display data is cached locally.
 */
export function extractAuthFromResponse(payload) {
  if (!payload) {
    return { user: null, role: "", message: "" };
  }

  if (payload.user) {
    return {
      user: payload.user,
      role: payload.user?.role || payload.role || "",
      message: payload.message || "",
    };
  }

  let inner = payload.data;

  if (typeof inner === "string") {
    return { user: null, role: "", message: payload.message || "" };
  }

  if (inner?.data && typeof inner.data === "object" && inner.data.user) {
    inner = inner.data;
  }

  const data = inner && typeof inner === "object" ? inner : payload;

  return {
    user: data.user || null,
    role: data.role || data.user?.role || "",
    message: payload.message || data.message || "",
  };
}

export function saveUserSession({ user, role }) {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }
  if (role) {
    localStorage.setItem("role", role);
  }
}

export function clearUserSession() {
  localStorage.removeItem("role");
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("adminRole");
  localStorage.removeItem("adminUser");
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminRefreshToken");
}

export function getCachedUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** @deprecated Tokens are in HttpOnly cookies — always returns empty string */
export function getStoredToken() {
  return "";
}

/** @deprecated Use saveUserSession */
export function saveAuthToLocalStorage({ user, role }) {
  saveUserSession({ user, role });
}

/** @deprecated Use clearUserSession */
export function clearAuthFromLocalStorage() {
  clearUserSession();
}
