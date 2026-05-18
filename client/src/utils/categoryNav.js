/** Main shop categories (MongoDB Category.slug values) */
export const MAIN_CATEGORY_SLUGS = ["men", "women", "kids"];

/** Stable empty object — avoids new `{}` every render (infinite fetch loops) */
const EMPTY_LEGACY_FILTERS = Object.freeze({});

export const isMainCategorySlug = (slug) =>
  slug && MAIN_CATEGORY_SLUGS.includes(String(slug).toLowerCase());

/** Breadcrumb / links: use real category slug or fallback to "all" */
export const getBreadcrumbCategorySlug = (category) => {
  if (!category) return "all";
  const slug =
    typeof category === "object" ? category.slug : null;
  if (isMainCategorySlug(slug)) return String(slug).toLowerCase();
  return "all";
};

/** Product page "View all similar" → category listing with same filters */
export const buildCategoryListingUrl = ({
  category,
  gender,
  clothingType,
} = {}) => {
  const baseSlug = getBreadcrumbCategorySlug(category);
  const params = new URLSearchParams();
  if (clothingType?.trim()) params.set("clothingType", clothingType.trim());
  if (gender?.trim()) params.set("gender", String(gender).trim().toLowerCase());
  const qs = params.toString();
  return `/category/${baseSlug}${qs ? `?${qs}` : ""}`;
};

/**
 * Old URLs used /category/T-Shirt/Unisex — map those to /category/all + filters.
 */
export const resolveCategoryRoute = (slug, subSlug) => {
  const lower = (slug || "").toLowerCase();

  if (lower === "all" || isMainCategorySlug(lower)) {
    return {
      effectiveSlug: lower || "all",
      effectiveSubSlug: subSlug || null,
      legacyFilters: EMPTY_LEGACY_FILTERS,
    };
  }

  const legacyFilters = {};
  if (slug) {
    legacyFilters.clothingType = decodeURIComponent(slug);
  }
  if (subSlug) {
    legacyFilters.gender = decodeURIComponent(subSlug);
  }

  return {
    effectiveSlug: "all",
    effectiveSubSlug: null,
    legacyFilters,
  };
};
