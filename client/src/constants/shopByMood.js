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
    occasion: "College",
    emoji: "🎓",
    gradient: "from-violet-600 to-indigo-700",
  },
  {
    id: "gym",
    label: "Gym",
    occasion: "Sports",
    emoji: "💪",
    gradient: "from-orange-500 to-rose-600",
  },
  {
    id: "travel",
    label: "Travel",
    occasion: "Travel",
    emoji: "✈️",
    gradient: "from-sky-500 to-cyan-600",
  },
  {
    id: "casual",
    label: "Casual",
    occasion: "Casual",
    emoji: "☀️",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    id: "streetwear",
    label: "Street",
    occasion: "Streetwear",
    emoji: "🔥",
    gradient: "from-amber-500 to-yellow-600",
  },
];

export const getMoodFilterHref = (occasion) =>
  `/category/all?occasion=${encodeURIComponent(occasion)}`;

/** Admin chip label — Sports shows as Gym on the homepage tile. */
export const getShopByMoodOccasionLabel = (occasion) => {
  if (occasion === "Sports") return "Sports (Gym)";
  return occasion;
};
