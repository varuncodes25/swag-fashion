import React, { useState } from "react";
import { starsGenerator } from "@/constants/helper";
import { toast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import useCartActions from "@/hooks/useCartActions";
import { Heart } from "lucide-react";

/* ================= PRODUCT CARD ================= */

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
  const slug = name?.split(" ").join("-") || "product";
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  // const { addToCart } = useCartActions();

  const [wishlisted, setWishlisted] = useState(false);

  /* ================= SAFE NUMBER HANDLING ================= */
  const safePrice = Number(price) || 0;
  const safeDiscountedPrice = Number(discountedPrice) || safePrice;
  const safeRating = Number(rating) || 0;
  const safeDiscount = Number(discount) || 0;

  /* ================= IMAGE ================= */
  const rawImage =
    image?.url ||
    variants?.[0]?.images?.[0]?.url ||
    "https://images.pexels.com/photos/3801990/pexels-photo-3801990.jpeg";

  const optimizeImg = (url) =>
    url?.replace("/upload/", "/upload/f_auto,q_auto,w_400/");

  const displayImage = optimizeImg(rawImage);

  /* ================= OFFER ================= */
  const isOfferActive =
    safeDiscount > 0 &&
    offerValidTill &&
    new Date(offerValidTill) >= new Date();

  const displayPrice = isOfferActive ? safeDiscountedPrice : safePrice;

  /* ================= ACTIONS ================= */

  const toggleWishlist = (e) => {
    e.preventDefault();
    setWishlisted((prev) => !prev);

    toast({
      title: !wishlisted
        ? "Added to Wishlist ❤️"
        : "Removed from Wishlist",
    });
  };

  // const handleAddToCart = (e) => {
  //   e.preventDefault();

  //   if (!isAuthenticated) {
  //     navigate("/login");
  //     return;
  //   }

  //   const user = JSON.parse(localStorage.getItem("user"));
  //   if (!user) return;

  //   addToCart({
  //     userId: user.id,
  //     productId: _id,
  //     quantity: 1,
  //     price: displayPrice,
  //     color: variants?.[0]?.color || "Default",
  //     size: "",
  //     toast,
  //   });
  // };

  /* ================= FORMAT PRICE ================= */
  const formatPrice = (price) => {
    const num = Number(price);
    if (isNaN(num)) return "₹0.00";
    return `₹${num.toFixed(2)}`;
  };

  /* ================= RENDER ================= */

  return (
    <div
      className="
        group relative overflow-hidden rounded-xl
        bg-white dark:bg-zinc-900
        border border-gray-200 dark:border-zinc-800
        shadow-sm hover:shadow-lg
        transition-all duration-300
      "
    >
      <Link to={`/product/${_id}`} className="block">
        {/* ===== Wishlist ===== */}
        <button
          onClick={toggleWishlist}
          className="
            absolute top-2 right-2 z-20
            p-2 rounded-full
            bg-white dark:bg-zinc-800
            shadow hover:shadow-md
            transition
          "
        >
          <Heart
            size={18}
            className={`transition ${
              wishlisted
                ? "fill-red-500 text-red-500 scale-110"
                : "text-gray-500"
            }`}
          />
        </button>

        {/* ===== Discount Badge ===== */}
        {isOfferActive && (
          <span
            className="
              absolute top-2 left-2 z-10
              px-2 py-1 rounded-full
              text-[11px] font-bold text-white
              bg-gradient-to-r from-red-500 to-orange-500
              shadow
            "
          >
            {safeDiscount}% OFF
          </span>
        )}

        {/* ===== Image ===== */}
        <div className="h-44 lg:h-56 bg-gray-100 overflow-hidden">
          <img
            src={displayImage}
            alt={name}
            loading="lazy"
            className="
              h-full w-full object-cover
              transition-transform duration-500
              group-hover:scale-105
            "
          />
        </div>

        {/* ===== Content ===== */}
        <div className="p-4 space-y-2">
          {/* Name */}
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
            {name || "Unnamed Product"}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 text-xs">
            <div className="flex text-yellow-400">
              {starsGenerator(safeRating)}
            </div>
            <span className="text-gray-500">
              {safeRating.toFixed(1)}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-gray-900 dark:text-yellow-400">
                {formatPrice(displayPrice)}
              </span>

              {isOfferActive && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(safePrice)}
                </span>
              )}
            </div>

            {isOfferActive && (
              <span
                className="
                  text-[11px] font-bold
                  px-2 py-[3px] rounded-full
                  bg-green-100 text-green-700
                  dark:bg-green-900/30 dark:text-green-400
                "
              >
                Save {safeDiscount}%
              </span>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={handleAddToCart}
            className="
              mt-3 w-full py-2.5 rounded-xl
              text-sm font-bold text-gray-900
              bg-gradient-to-r from-yellow-400 to-yellow-500
              hover:from-yellow-500 hover:to-yellow-600
              shadow hover:shadow-md
              active:scale-[0.97]
              transition
            "
          >
            Add to Cart
          </button>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;