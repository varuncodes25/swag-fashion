import React from "react";
import { starsGenerator } from "@/constants/helper";
import { toast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import useCartActions from "@/hooks/useCartActions";

const ProductCard = ({
  _id,
  name = "Product Title",
  price = 2000,
  rating = 4,
  image = null,
  discountedPrice = price,
  discount = 0,
  offerValidTill,
  variants = [],
}) => {
  const slug = name.split(" ").join("-");
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { addToCart } = useCartActions();

  const now = new Date();
  const isOfferActive =
    offerValidTill && new Date(offerValidTill) >= now && discount > 0;

  const displayPrice = isOfferActive ? discountedPrice : price;

  const displayImage =
    image?.url ||
    variants?.[0]?.images?.[0]?.url ||
    "https://images.pexels.com/photos/3801990/pexels-photo-3801990.jpeg";

  const handleAddToCart = (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    addToCart({
      userId: user.id,
      productId: _id,
      quantity: 1,
      price: displayPrice,
      color: variants?.[0]?.color || "Default",
      size: "",
      toast,
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden 
                    border shadow-sm hover:shadow-xl transition-all duration-300">
      <Link to={`/product/${slug}`} className="block">
        {/* Image */}
        <div className="relative h-60 overflow-hidden">
          <img
            src={displayImage}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />

          {isOfferActive && (
            <span className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 
                             text-xs font-semibold px-2 py-1 rounded-full">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-1">
            {name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 text-sm">
            {starsGenerator(rating)}
            <span className="text-gray-500">({rating.toFixed(1)})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            {isOfferActive && (
              <span className="text-sm text-gray-400 line-through">
                ₹{price.toFixed(2)}
              </span>
            )}
            <span className="text-lg font-bold text-gray-900 dark:text-yellow-400">
              ₹{displayPrice.toFixed(2)}
            </span>
          </div>

          {/* CTA */}
          <button
            onClick={handleAddToCart}
            className="mt-3 w-full py-2 rounded-lg 
                       bg-yellow-500 text-gray-900 font-medium
                       hover:bg-yellow-600 transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
