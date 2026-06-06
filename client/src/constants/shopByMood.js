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
    gradient: "from-violet-500/20 to-purple-600/10",
  },
  {
    id: "gym",
    label: "Gym",
    occasion: "Sports",
    gradient: "from-orange-500/20 to-red-600/10",
  },
  {
    id: "travel",
    label: "Travel",
    occasion: "Travel",
    gradient: "from-sky-500/20 to-blue-600/10",
  },
  {
    id: "casual",
    label: "Casual",
    occasion: "Casual",
    gradient: "from-emerald-500/20 to-teal-600/10",
  },
  {
    id: "streetwear",
    label: "Streetwear",
    occasion: "Streetwear",
    gradient: "from-amber-500/20 to-yellow-600/10",
  },
];

/** Admin chip label — Sports shows as Gym on the homepage tile. */
export const getShopByMoodOccasionLabel = (occasion) => {
  if (occasion === "Sports") return "Sports (Gym)";
  return occasion;
};
