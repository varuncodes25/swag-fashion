const DEFAULT_TITLE = "Swag Fashion | Trendy Streetwear & Everyday Style";
const DEFAULT_DESCRIPTION =
  "Shop premium t-shirts, streetwear, and everyday fashion at Swag Fashion. Fast shipping, easy returns, and top quality styles.";

const upsertMeta = (attr, key, content) => {
  if (typeof document === "undefined" || !key || !content) return;
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const upsertCanonical = (href) => {
  if (typeof document === "undefined" || !href) return;
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
};

export const getCanonicalFromPath = (pathWithQuery = "") => {
  if (typeof window === "undefined") return pathWithQuery || "/";
  return `${window.location.origin}${pathWithQuery || window.location.pathname}`;
};

export const applySeoMeta = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogImage,
  robots = "index,follow",
}) => {
  if (typeof document === "undefined") return;

  document.title = title;
  upsertMeta("name", "description", description);
  upsertMeta("name", "robots", robots);

  upsertMeta("property", "og:title", title);
  upsertMeta("property", "og:description", description);
  upsertMeta("property", "og:type", "website");
  if (ogImage) upsertMeta("property", "og:image", ogImage);

  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", title);
  upsertMeta("name", "twitter:description", description);
  if (ogImage) upsertMeta("name", "twitter:image", ogImage);

  upsertCanonical(canonical || getCanonicalFromPath());
};

export const applyJsonLd = (id, payload) => {
  if (typeof document === "undefined" || !id || !payload) return;
  let script = document.head.querySelector(`script[data-seo-jsonld="${id}"]`);
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-seo-jsonld", id);
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(payload);
};

