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
  },
  {
    id: "gym",
    label: "Gym",
    occasion: "Sports",
  },
  {
    id: "travel",
    label: "Travel",
    occasion: "Travel",
  },
  {
    id: "casual",
    label: "Casual",
    occasion: "Casual",
  },
  {
    id: "streetwear",
    label: "Street",
    occasion: "Streetwear",
  },
];

export const getMoodFilterHref = (occasion) =>
  `/category/all?occasion=${encodeURIComponent(occasion)}`;

/** Local fallbacks when no catalog product is tagged for that mood. */
export const MOOD_FALLBACK_IMAGES = {
  college: "/images/home-mood/college.jpg",
  gym: "/images/home-mood/gym.jpg",
  travel: "/images/home-mood/travel.jpg",
  casual: "/images/home-mood/casual.jpg",
  streetwear: "/images/home-mood/streetwear.jpg",
};

/** Admin chip label — Sports shows as Gym on the homepage tile. */
export const getShopByMoodOccasionLabel = (occasion) => {
  if (occasion === "Sports") return "Sports (Gym)";
  return occasion;
};
