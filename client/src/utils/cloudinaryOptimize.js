/**
 * Inserts Cloudinary delivery transforms for smaller, modern formats when possible.
 * No-op for non-Cloudinary URLs.
 */
export function cloudinaryOptimize(url, { maxWidth = 1600 } = {}) {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("res.cloudinary.com")) return url;
  const marker = "/upload/";
  const i = url.indexOf(marker);
  if (i === -1) return url;
  const rest = url.slice(i + marker.length);
  if (rest.includes("f_auto")) return url;
  const tx = `f_auto,q_auto,c_limit,w_${maxWidth}/`;
  return url.slice(0, i + marker.length) + tx + rest;
}
