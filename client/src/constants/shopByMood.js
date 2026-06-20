/** Homepage "Shop By Mood" tiles — each maps to the product `occasion` field. */
export const SHOP_BY_MOOD_OCCASIONS = [
  "College",
  "Sports",
  "Travel",
  "Casual",
  "Streetwear",
];

export const SHOP_BY_MOOD_TILES = [
  {
    id: "college",
    label: "College",
    tagline: "Campus fits",
    occasion: "College",
    gradient: "from-violet-600 via-purple-600 to-indigo-800",
  },
  {
    id: "gym",
    label: "Gym",
    tagline: "Move & train",
    occasion: "Sports",
    gradient: "from-orange-500 via-rose-500 to-red-600",
  },
  {
    id: "travel",
    label: "Travel",
    tagline: "On the go",
    occasion: "Travel",
    gradient: "from-sky-500 via-blue-500 to-cyan-700",
  },
  {
    id: "casual",
    label: "Casual",
    tagline: "Everyday ease",
    occasion: "Casual",
    gradient: "from-emerald-500 via-teal-500 to-green-700",
  },
  {
    id: "streetwear",
    label: "Street",
    tagline: "Bold looks",
    occasion: "Streetwear",
    gradient: "from-amber-500 via-orange-500 to-yellow-600",
  },
];

export const getMoodFilterHref = (occasion) =>
  `/category/all?occasion=${encodeURIComponent(occasion)}`;

/** Admin chip label — Sports shows as Gym on the homepage tile. */
export const getShopByMoodOccasionLabel = (occasion) => {
  if (occasion === "Sports") return "Sports (Gym)";
  return occasion;
};
