const PLACEHOLDER_MARKERS = ["default-avatar", "cloudinary.com/demo/"];

export function isPlaceholderAvatar(url) {
  if (!url || typeof url !== "string") return true;
  const trimmed = url.trim();
  if (!trimmed) return true;
  return PLACEHOLDER_MARKERS.some((marker) => trimmed.includes(marker));
}

/** Avatar URL safe to show in UI (skip broken default placeholders). */
export function resolveDisplayAvatarUrl(avatar) {
  if (!avatar || isPlaceholderAvatar(avatar)) return undefined;
  if (avatar.startsWith("http://") || avatar.startsWith("https://") || avatar.startsWith("/")) {
    return avatar;
  }
  return avatar;
}
