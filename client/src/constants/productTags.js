/**
 * Product tags — admin assigns on create/edit; users filter via search or ?tags=
 */

export const PRODUCT_TAG_GROUPS = [
  {
    label: "Gods",
    tags: [
      "Gods",
      "Krishna",
      "Shiva",
      "Ganesha",
      "Hanuman",
      "Ram",
      "Vishnu",
      "Durga",
      "Lakshmi",
    ],
  },
  {
    label: "Cartoon & characters",
    tags: ["Cartoon", "Anime", "Disney", "Marvel", "DC", "Ben 10"],
  },
  {
    label: "Themes",
    tags: [
      "Typography",
      "Vintage",
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

/** One URL → many tags (OR). Keep in sync with server/constants/productTagGroups.js */
export const TAG_FILTER_GROUPS = {
  gods: {
    label: "All Gods",
    tags: [
      "Gods",
      "Krishna",
      "Shiva",
      "Ganesha",
      "Hanuman",
      "Ram",
      "Vishnu",
      "Durga",
      "Lakshmi",
    ],
  },
  cartoon: {
    label: "Cartoon & Characters",
    tags: ["Cartoon", "Anime", "Disney", "Marvel", "DC", "Ben 10"],
  },
};

/** Quick taps on category page — uses exact tag filter (faster than text search) */
export const POPULAR_SEARCH_TAGS = [
  { label: "Marvel", type: "tag", value: "Marvel" },
  { label: "Anime", type: "tag", value: "Anime" },
  { label: "Krishna", type: "tag", value: "Krishna" },
  { label: "Ben 10", type: "tag", value: "Ben 10" },
  { label: "All Gods", type: "group", value: "gods" },
  { label: "Cartoon", type: "group", value: "cartoon" },
];

export const PRODUCT_TAG_PRESETS = PRODUCT_TAG_GROUPS.flatMap((g) => g.tags);

export const getTagFilterHref = (tag) =>
  `/category/all?tags=${encodeURIComponent(tag)}`;

export const getTagGroupFilterHref = (groupKey) =>
  `/category/all?tagGroup=${encodeURIComponent(groupKey)}`;
