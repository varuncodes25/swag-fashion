import fs from "node:fs/promises";
import path from "node:path";

const SITE_URL = (process.env.SITE_URL || "https://www.swagfashion.in").replace(
  /\/$/,
  ""
);

const STATIC_FALLBACK = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE_URL}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>${SITE_URL}/category/men</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>${SITE_URL}/category/women</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>${SITE_URL}/category/kids</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>${SITE_URL}/about</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>${SITE_URL}/contact</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>${SITE_URL}/faq</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
</urlset>`;

const getApiBases = () => {
  const fromEnv = (process.env.VITE_API_URL || "")
    .trim()
    .replace(/\/api\/?$/i, "");
  const defaults = ["https://swag-fashion-1.onrender.com"];
  return [...new Set([fromEnv, ...defaults].filter(Boolean))];
};

const fetchSitemapFromApi = async () => {
  for (const base of getApiBases()) {
    const url = `${base.replace(/\/$/, "")}/sitemap.xml`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(120000) });
      if (!res.ok) {
        console.warn(`[sitemap] ${url} → HTTP ${res.status}`);
        continue;
      }
      const xml = (await res.text()).trim();
      if (!xml.includes("<urlset")) {
        console.warn(`[sitemap] ${url} → invalid XML`);
        continue;
      }
      console.log(`[sitemap] Fetched from ${url}`);
      return xml;
    } catch (err) {
      console.warn(`[sitemap] ${url} → ${err.message}`);
    }
  }
  return null;
};

const countUrls = (xml) => (xml.match(/<loc>/g) || []).length;

const writeSitemap = async (xml) => {
  const publicPath = path.join(process.cwd(), "public", "sitemap.xml");
  const distPath = path.join(process.cwd(), "dist", "sitemap.xml");

  await fs.writeFile(publicPath, xml, "utf8");
  console.log(`[sitemap] Wrote ${publicPath} (${countUrls(xml)} URLs)`);

  try {
    await fs.access(path.join(process.cwd(), "dist"));
    await fs.writeFile(distPath, xml, "utf8");
    console.log(`[sitemap] Wrote ${distPath}`);
  } catch {
    /* dist may not exist during local dev */
  }
};

const run = async () => {
  const xml = (await fetchSitemapFromApi()) || STATIC_FALLBACK;
  if (xml === STATIC_FALLBACK) {
    console.warn("[sitemap] API unavailable — using static fallback (no products)");
  }
  await writeSitemap(xml);
};

run().catch((err) => {
  console.error("[sitemap] Failed:", err);
  process.exit(1);
});
