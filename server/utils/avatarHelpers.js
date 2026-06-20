const DEFAULT_AVATAR_URL =
  "https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png";

const PLACEHOLDER_MARKERS = ["default-avatar", "cloudinary.com/demo/"];

const isPlaceholderAvatar = (url) => {
  if (!url || typeof url !== "string") return true;
  const trimmed = url.trim();
  if (!trimmed || trimmed === DEFAULT_AVATAR_URL) return true;
  return PLACEHOLDER_MARKERS.some((marker) => trimmed.includes(marker));
};

const isGoogleAvatarUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  return (
    url.includes("googleusercontent.com") ||
    url.includes("ggpht.com") ||
    url.includes("google.com/")
  );
};

/** Save or refresh Google profile photo without overwriting a custom upload. */
const applyGoogleProfilePicture = (user, picture) => {
  if (!picture) return;

  if (isPlaceholderAvatar(user.avatar) || isGoogleAvatarUrl(user.avatar)) {
    user.avatar = picture;
  }
};

module.exports = {
  DEFAULT_AVATAR_URL,
  isPlaceholderAvatar,
  isGoogleAvatarUrl,
  applyGoogleProfilePicture,
};
