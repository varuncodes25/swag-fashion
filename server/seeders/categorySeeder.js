require("dotenv").config();
const { connectDb } = require("../db/connection");
const Category = require("../models/Category");

const categories = [
  {
    name: "Men",
    slug: "men",
    image: {
      url: "https://images.pexels.com/photos/3801990/pexels-photo-3801990.jpeg",
      id: "men-category",
    },
    subCategories: [
      {
        name: "Round Neck",
        slug: "round-neck",
        image: {
          url: "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg",
          id: "men-round-neck",
        },
      },
      {
        name: "Polo T-Shirts",
        slug: "polo",
        image: {
          url: "https://images.pexels.com/photos/6311387/pexels-photo-6311387.jpeg",
          id: "men-polo",
        },
      },
      {
        name: "Oversized T-Shirts",
        slug: "oversized",
        image: {
          url: "https://images.pexels.com/photos/3662908/pexels-photo-3662908.jpeg",
          id: "men-oversized",
        },
      },
      {
        name: "Printed T-Shirts",
        slug: "printed",
        image: {
          url: "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg",
          id: "men-printed",
        },
      },
      {
        name: "Solid T-Shirts",
        slug: "solid",
        image: {
          url: "https://images.pexels.com/photos/3801990/pexels-photo-3801990.jpeg",
          id: "men-solid",
        },
      },
      {
        name: "Full Sleeve",
        slug: "full-sleeve",
        image: {
          url: "https://images.pexels.com/photos/6311387/pexels-photo-6311387.jpeg",
          id: "men-full-sleeve",
        },
      },
      {
        name: "Gym / Sports",
        slug: "gym-sports",
        image: {
          url: "https://images.pexels.com/photos/3662908/pexels-photo-3662908.jpeg",
          id: "men-gym",
        },
      },
    ],
  },

  {
    name: "Women",
    slug: "women",
    image: {
      url: "https://images.pexels.com/photos/6311387/pexels-photo-6311387.jpeg",
      id: "women-category",
    },
    subCategories: [
      {
        name: "Round Neck",
        slug: "round-neck",
        image: {
          url: "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg",
          id: "women-round-neck",
        },
      },
      {
        name: "Oversized T-Shirts",
        slug: "oversized",
        image: {
          url: "https://images.pexels.com/photos/3662908/pexels-photo-3662908.jpeg",
          id: "women-oversized",
        },
      },
      {
        name: "Printed T-Shirts",
        slug: "printed",
        image: {
          url: "https://images.pexels.com/photos/6311387/pexels-photo-6311387.jpeg",
          id: "women-printed",
        },
      },
      {
        name: "Solid T-Shirts",
        slug: "solid",
        image: {
          url: "https://images.pexels.com/photos/3801990/pexels-photo-3801990.jpeg",
          id: "women-solid",
        },
      },
      {
        name: "Crop Tops",
        slug: "crop-tops",
        image: {
          url: "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg",
          id: "women-crop",
        },
      },
      {
        name: "Active Wear",
        slug: "active-wear",
        image: {
          url: "https://images.pexels.com/photos/3662908/pexels-photo-3662908.jpeg",
          id: "women-active",
        },
      },
    ],
  },

  {
    name: "Kids",
    slug: "kids",
    image: {
      url: "https://images.pexels.com/photos/3662908/pexels-photo-3662908.jpeg",
      id: "kids-category",
    },
    subCategories: [
      {
        name: "Boys T-Shirts",
        slug: "boys",
        image: {
          url: "https://images.pexels.com/photos/3801990/pexels-photo-3801990.jpeg",
          id: "kids-boys",
        },
      },
      {
        name: "Girls T-Shirts",
        slug: "girls",
        image: {
          url: "https://images.pexels.com/photos/6311387/pexels-photo-6311387.jpeg",
          id: "kids-girls",
        },
      },
      {
        name: "Cartoon Prints",
        slug: "cartoon",
        image: {
          url: "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg",
          id: "kids-cartoon",
        },
      },
      {
        name: "School Wear",
        slug: "school-wear",
        image: {
          url: "https://images.pexels.com/photos/3662908/pexels-photo-3662908.jpeg",
          id: "kids-school",
        },
      },
    ],
  },
  {
  name: "Collections",
  slug: "collections",
  image: {
    url: "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg",
    id: "collections-category",
  },
  subCategories: [
    {
      name: "New Arrivals",
      slug: "new-arrivals",
      image: {
        url: "https://images.pexels.com/photos/3801990/pexels-photo-3801990.jpeg",
        id: "collections-new-arrivals",
      },
    },
    {
      name: "Best Sellers",
      slug: "best-sellers",
      image: {
        url: "https://images.pexels.com/photos/6311387/pexels-photo-6311387.jpeg",
        id: "collections-best-sellers",
      },
    },
    {
      name: "Trending Now",
      slug: "trending",
      image: {
        url: "https://images.pexels.com/photos/3662908/pexels-photo-3662908.jpeg",
        id: "collections-trending",
      },
    },
    {
      name: "Limited Edition",
      slug: "limited-edition",
      image: {
        url: "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg",
        id: "collections-limited",
      },
    },
    {
      name: "Sale",
      slug: "sale",
      image: {
        url: "https://images.pexels.com/photos/6311387/pexels-photo-6311387.jpeg",
        id: "collections-sale",
      },
    },
  ],
},
{
  name: "Style",
  slug: "style",
  image: {
    url: "https://images.pexels.com/photos/3662908/pexels-photo-3662908.jpeg",
    id: "style-category",
  },
  subCategories: [
    {
      name: "Streetwear",
      slug: "streetwear",
      image: {
        url: "https://images.pexels.com/photos/3801990/pexels-photo-3801990.jpeg",
        id: "style-streetwear",
      },
    },
    {
      name: "Minimal",
      slug: "minimal",
      image: {
        url: "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg",
        id: "style-minimal",
      },
    },
    {
      name: "Anime",
      slug: "anime",
      image: {
        url: "https://images.pexels.com/photos/6311387/pexels-photo-6311387.jpeg",
        id: "style-anime",
      },
    },
    {
      name: "Typography",
      slug: "typography",
      image: {
        url: "https://images.pexels.com/photos/3662908/pexels-photo-3662908.jpeg",
        id: "style-typography",
      },
    },
    {
      name: "Graphic Tees",
      slug: "graphic-tees",
      image: {
        url: "https://images.pexels.com/photos/3801990/pexels-photo-3801990.jpeg",
        id: "style-graphic",
      },
    },
  ],
}


];

const seedCategories = async () => {
  try {
    await connectDb();

    await Category.deleteMany({});
    console.log("🗑️ Previous categories removed");

    await Category.insertMany(categories);
    console.log("✅ Categories + SubCategories with images inserted");

    process.exit(0);
  } catch (error) {
    console.error("❌ Category seeder error:", error);
    process.exit(1);
  }
};

seedCategories();
