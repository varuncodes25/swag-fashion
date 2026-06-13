const ACCESS_COOKIE = "token";
const REFRESH_COOKIE = "refreshToken";

const isProduction = process.env.NODE_ENV === "production";

function baseCookieOptions(maxAgeMs) {
  return {
    httpOnly: true,
    secure: isProduction || process.env.COOKIE_SECURE === "true",
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    ...(maxAgeMs != null ? { maxAge: maxAgeMs } : {}),
  };
}

const ACCESS_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_MAX_AGE_MS =
  Number(process.env.REFRESH_COOKIE_MAX_AGE_MS) ||
  30 * 24 * 60 * 60 * 1000;

function setAuthCookies(res, { accessToken, refreshToken }) {
  if (accessToken) {
    res.cookie(ACCESS_COOKIE, accessToken, baseCookieOptions(ACCESS_MAX_AGE_MS));
  }
  if (refreshToken) {
    res.cookie(
      REFRESH_COOKIE,
      refreshToken,
      baseCookieOptions(REFRESH_MAX_AGE_MS),
    );
  }
}

function clearAuthCookies(res) {
  const clearOpts = { path: "/", secure: baseCookieOptions().secure };
  res.clearCookie(ACCESS_COOKIE, clearOpts);
  res.clearCookie(REFRESH_COOKIE, clearOpts);
}

function getAccessTokenFromRequest(req) {
  return (
    req.cookies?.[ACCESS_COOKIE] ||
    req.header("Authorization")?.split(" ")[1] ||
    null
  );
}

function getRefreshTokenFromRequest(req) {
  return req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken || null;
}

module.exports = {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  setAuthCookies,
  clearAuthCookies,
  getAccessTokenFromRequest,
  getRefreshTokenFromRequest,
};
