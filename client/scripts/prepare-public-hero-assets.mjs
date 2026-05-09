import fs from "node:fs/promises";
import path from "node:path";

/**
 * Copies fixed home-banner sources into /public/images so:
 * - URLs stay stable for <link rel="preload"> (no hashed /assets names)
 * - Large PNGs are not pulled through the JS module graph
 */
const ROOT = path.resolve(process.cwd());
const ASSETS = path.join(ROOT, "src", "assets");
const OUT_DIR = path.join(ROOT, "public", "images");

const COPIES = [
  ["god mode banner.png", "banner-slide-1-desktop.png"],
  ["mobile1.png", "banner-slide-1-mobile.png"],
  ["banner3.png", "banner-slide-2-desktop.png"],
  ["mobile3.png", "banner-slide-2-mobile.png"],
];

const run = async () => {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await Promise.all(
    COPIES.map(async ([srcName, destName]) => {
      const from = path.join(ASSETS, srcName);
      const to = path.join(OUT_DIR, destName);
      await fs.copyFile(from, to);
    })
  );
  console.log(
    `[prepare-public-hero-assets] Copied ${COPIES.length} hero images to public/images/`
  );
};

run().catch((err) => {
  console.error("[prepare-public-hero-assets] Failed:", err);
  process.exit(1);
});
