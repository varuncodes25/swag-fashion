/** Main shop categories (MongoDB Category.slug values) */
export const MAIN_CATEGORY_SLUGS = ["men", "women", "kids"];

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

/**
 * Old URLs used /category/T-Shirt/Unisex — map those to /category/all + filters.
 */
export const resolveCategoryRoute = (slug, subSlug) => {
  const lower = (slug || "").toLowerCase();

  if (lower === "all" || isMainCategorySlug(lower)) {
    return {
      effectiveSlug: lower || "all",
      effectiveSubSlug: subSlug || null,
      legacyFilters: {},
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
