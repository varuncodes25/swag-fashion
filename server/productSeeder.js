require("dotenv").config();
const mongoose = require("mongoose");
const { connectDb } = require("./db/connection");

const Product = require("./models/Product");

const categories = ["Men", "Women", "Kid", "Men & Women"];
const colors = ["Black", "White", "Blue", "Red", "Pink", "Green"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

const images = [
  "https://images.pexels.com/photos/3801990/pexels-photo-3801990.jpeg",
  "https://images.pexels.com/photos/6311387/pexels-photo-6311387.jpeg",
  "https://images.pexels.com/photos/3662908/pexels-photo-3662908.jpeg",
  "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg",
];

const products = [];

for (let i = 1; i <= 200; i++) {
  const category = categories[i % categories.length];
  const color = colors[i % colors.length];
  const imageUrl = images[i % images.length];
  const price = 500 + (i % 10) * 100;
  const discount = (i % 5) * 5; // 0,5,10,15,20

  products.push({
    name: `Swag Fashion T-Shirt ${i}`,
    price,
    description: `Premium quality t-shirt number ${i} from Swag Fashion.`,
    stock: 50 + (i % 50),

    variants: [
      {
        color,
        images: [
          {
            url: imageUrl,
            id: `img-${i}`,
          },
        ],
      },
    ],

    colors: [color],
    sizes: sizes.slice(0, (i % sizes.length) + 1),

    category,
    discount,
    offerTitle: discount > 0 ? "Mega Sale" : null,
    offerDescription:
      discount > 0 ? "Limited time discount offer" : null,

    // 🔥 ACTIVE OFFER
    offerValidFrom: discount > 0
      ? new Date(Date.now() - 24 * 60 * 60 * 1000)
      : null,
    offerValidTill: discount > 0
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      : null,
  });
}

const seedProducts = async () => {
  try {
    await connectDb();

    await Product.deleteMany(); // optional
    console.log("Old products removed");

    await Product.insertMany(products);
    console.log("✅ 200 Products inserted successfully");

    process.exit();
  } catch (error) {
    console.error("Seeder error:", error);
    process.exit(1);
  }
};

seedProducts();
