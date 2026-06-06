/**
 * Product tags — admin assigns on create/edit; users filter via ?tags=Anime etc.
 * Grouped for the admin form; flat list for validation hints.
 */

export const PRODUCT_TAG_GROUPS = [
  {
    label: "Themes & search (Anime, Gaming, etc.)",
    tags: [
      "Anime",
      "Typography",
      "Vintage",
      "Cartoon",
      "Gaming",
      "Music",
      "Sports",
      "Tie-Dye",
      "Oversized",
    ],
  },
  {
    label: "Trending",
    tags: ["New Arrival", "Best Seller", "Limited Edition", "Premium"],
  },
];

export const PRODUCT_TAG_PRESETS = PRODUCT_TAG_GROUPS.flatMap((g) => g.tags);

export const getTagFilterHref = (tag) =>
  `/category/all?tags=${encodeURIComponent(tag)}`;
