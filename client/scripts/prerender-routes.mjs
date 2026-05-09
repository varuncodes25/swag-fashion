import fs from "node:fs/promises";
import path from "node:path";

const DIST_DIR = path.resolve(process.cwd(), "dist");
const INDEX_HTML_PATH = path.join(DIST_DIR, "index.html");
const SITE_URL = (process.env.SITE_URL || "https://www.swagfashion.in").replace(
  /\/$/,
  ""
);

const STATIC_ROUTES = [
  {
    route: "/",
    title: "Swag Fashion | Trending T-Shirts & Streetwear",
    description:
      "Discover trending t-shirts, oversized fits, and streetwear essentials at Swag Fashion. Shop men, women, and kids collections.",
  },
  {
    route: "/category/men",
    title: "Men Collection | Swag Fashion",
    description:
      "Shop men t-shirts and streetwear styles at Swag Fashion. Filter by color, size, fit, and price.",
  },
  {
    route: "/category/women",
    title: "Women Collection | Swag Fashion",
    description:
      "Explore women fashion and streetwear essentials at Swag Fashion. Discover latest drops and premium styles.",
  },
  {
    route: "/category/kids",
    title: "Kids Collection | Swag Fashion",
    description:
      "Buy kids fashion collection online at Swag Fashion. Comfortable styles with easy size and color filters.",
  },
  {
    route: "/about",
    title: "About Us | Swag Fashion",
    description:
      "Learn more about Swag Fashion, our style philosophy, and our mission to deliver premium streetwear.",
  },
  {
    route: "/contact",
    title: "Contact Us | Swag Fashion",
    description:
      "Get in touch with Swag Fashion for orders, support, collaborations, and customer queries.",
  },
  {
    route: "/faq",
    title: "FAQ | Swag Fashion",
    description:
      "Find answers to common questions about shipping, returns, sizes, and orders at Swag Fashion.",
  },
];

const PRODUCT_SLUGS = (process.env.PRERENDER_PRODUCT_SLUGS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const stripOldCanonical = (html) =>
  html.replace(/<link\s+rel="canonical"[^>]*>\s*/gi, "");

const injectHeadTags = (html, { title, description, canonical, route }) => {
  let next = stripOldCanonical(html);

  const homeHeroPreloads =
    route === "/"
      ? [
          '    <link rel="preload" as="image" href="/images/banner-slide-1-mobile.png" media="(max-width: 639px)" fetchpriority="high" />',
          '    <link rel="preload" as="image" href="/images/banner-slide-1-desktop.png" media="(min-width: 640px)" fetchpriority="high" />',
          "",
        ].join("\n")
      : "";

  if (homeHeroPreloads) {
    next = next.replace(
      /<meta\s+charset="UTF-8"\s*\/?>/i,
      `<meta charset="UTF-8" />\n${homeHeroPreloads}`
    );
  }

  next = next.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  next = next.replace(
    /<meta\s+name="description"[^>]*>/i,
    `<meta name="description" content="${description}" />`
  );
  next = next.replace(
    "</head>",
    `  <link rel="canonical" href="${canonical}" />\n</head>`
  );

  return next;
};

const ensureRouteHtml = async (baseHtml, routeConfig) => {
  const normalizedRoute = routeConfig.route.replace(/^\/+|\/+$/g, "");
  const routeDir = normalizedRoute
    ? path.join(DIST_DIR, normalizedRoute)
    : DIST_DIR;
  const outputPath = path.join(routeDir, "index.html");

  await fs.mkdir(routeDir, { recursive: true });
  const canonical = `${SITE_URL}${routeConfig.route}`;
  const content = injectHeadTags(baseHtml, {
    title: routeConfig.title,
    description: routeConfig.description,
    canonical,
    route: routeConfig.route,
  });
  await fs.writeFile(outputPath, content, "utf8");
};

const run = async () => {
  const exists = await fs
    .access(INDEX_HTML_PATH)
    .then(() => true)
    .catch(() => false);

  if (!exists) {
    throw new Error("dist/index.html not found. Run vite build first.");
  }

  const baseHtml = await fs.readFile(INDEX_HTML_PATH, "utf8");
  const routes = [...STATIC_ROUTES];

  PRODUCT_SLUGS.forEach((slug) => {
    routes.push({
      route: `/product/${slug}`,
      title: `${slug.replace(/-/g, " ")} | Swag Fashion`,
      description:
        "Shop this product at Swag Fashion. Explore latest streetwear styles, offers, and available sizes.",
    });
  });

  await Promise.all(routes.map((route) => ensureRouteHtml(baseHtml, route)));
  console.log(`[prerender] Generated ${routes.length} route snapshots`);
};

run().catch((err) => {
  console.error("[prerender] Failed:", err);
  process.exit(1);
});

