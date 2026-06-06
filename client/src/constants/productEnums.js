/** Shared product enums — create form, filters, validation */

/** Tees store: only patterns customers actually shop by */
export const PATTERNS = [
  "Solid",
  "Plain",
  "Graphic",
  "Printed",
  "Striped",
  "Checked",
  "Tie-Dye",
];

export const WASH_TYPES = [
  "Normal Wash",
  "Acid Wash",
  "Stone Wash",
  "Enzyme Wash",
  "Bio Wash",
  "Distressed Wash",
  "Not Applicable",
];

export const SEASONS = [
  "Summer",
  "Winter",
  "Spring",
  "Autumn",
  "All Season",
  "Monsoon",
];

export const FITS = [
  "Oversized",
  "Regular",
  "Slim",
  "Relaxed",
  "Athletic",
  "Tailored",
  "Not Applicable",
];

export const HOME_STYLE_FILTERS = [
  { value: "all", label: "All homepage styles" },
  { value: "graphic", label: "Graphic Prints" },
  { value: "acid-wash", label: "Acid Wash" },
  { value: "minimalist", label: "Minimalist" },
  { value: "solids", label: "Solids" },
];

export const SHOP_BY_STYLE_LINKS = [
  { id: "graphic", label: "Graphic Prints", href: "/category/all?style=graphic" },
  { id: "anime", label: "Anime", href: "/category/all?search=anime" },
  { id: "acid-wash", label: "Acid Wash", href: "/category/all?style=acid-wash" },
  { id: "minimalist", label: "Minimalist", href: "/category/all?style=minimalist" },
  { id: "solids", label: "Solids", href: "/category/all?style=solids" },
];

export const WASH_TYPE_FILTER_OPTIONS = [
  "Normal Wash",
  "Acid Wash",
  "Stone Wash",
  "Enzyme Wash",
  "Bio Wash",
  "Distressed Wash",
];
