import { cloudinaryOptimize } from "./cloudinaryOptimize";

export function getImageUrl(img) {
  if (!img) return "";
  if (typeof img === "string") return img.trim();
  return String(img.url || img.secure_url || "").trim();
}

export function normalizeColorKey(color) {
  return String(color ?? "").trim().toLowerCase();
}

/** Ensure every gallery item has a usable .url */
export function normalizeProductImages(images = []) {
  return (Array.isArray(images) ? images : [])
    .map((img) => {
      const url = getImageUrl(img);
      if (!url) return null;
      return typeof img === "object" && img !== null ? { ...img, url } : { url };
    })
    .filter(Boolean);
}

export function optimizeGalleryImage(
  url,
  { maxWidth = 900, thumb = false, square = false } = {},
) {
  if (!url) return "";
  const width = thumb ? (square ? 400 : 120) : maxWidth;
  return cloudinaryOptimize(url, { maxWidth: width, square: Boolean(square) });
}

export function preloadImageUrls(urls = [], options = {}) {
  normalizeProductImages(urls.map((u) => (typeof u === "string" ? { url: u } : u)))
    .map((img) => optimizeGalleryImage(img.url, options))
    .forEach((src) => {
      if (!src) return;
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    });
}

/** Case-insensitive imagesByColor lookup + allImages fallback */
export function resolveImagesForColor(product, colorName) {
  if (!product) return [];

  const allImages = normalizeProductImages(product.allImages || []);
  if (!colorName) {
    if (allImages.length > 0) return allImages;
    const single = getImageUrl(product.image);
    return single ? [{ url: single }] : [];
  }

  const target = normalizeColorKey(colorName);
  const byColor = product.imagesByColor;

  if (byColor && typeof byColor === "object") {
    const matchedKey = Object.keys(byColor).find(
      (key) => normalizeColorKey(key) === target,
    );
    if (matchedKey) {
      const fromMap = normalizeProductImages(byColor[matchedKey]);
      if (fromMap.length > 0) return fromMap;
    }
  }

  const filtered = allImages.filter(
    (img) => normalizeColorKey(img.color) === target,
  );
  if (filtered.length > 0) return filtered;

  if (allImages.length > 0) return allImages;

  const single = getImageUrl(product.image);
  return single ? [{ url: single }] : [];
}
