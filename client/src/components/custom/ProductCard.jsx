import React, { useState, useEffect } from "react";
import { starsGenerator } from "@/constants/helper";
import { toast } from "@/hooks/use-toast";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import {
  optimisticToggle,
  revertOptimisticToggle,
  toggleWishlist,
} from "@/redux/slices/wishlistSlice";

/* ================= PRODUCT CARD ================= */
const ProductCard = ({
  _id,
  name = "Product Title",
  
  // ✅ IMPORTANT: API se 'price' aur 'sellingPrice' aata hai
  price = 2000,            // Original/MRP Price
  sellingPrice = price,    // Discounted Price (API se aata hai)
  
  // ✅ Discount prop ko use karo (API se aata hai)
  discount = 0,            // Discount percentage (API se aata hai)
  
  rating = 4,
  image = null,
  variants = [],
  totalStock = 0,
  reviewCount = 0
}) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { wishlistStatus } = useSelector((state) => state.wishlist);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [isToggling, setIsToggling] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  /* ================= SAFE NUMBER HANDLING ================= */
  const safePrice = Number(price) || 0;
  const safeSellingPrice = Number(sellingPrice) || safePrice;
  const safeRating = Number(rating) || 0;
  const safeDiscount = Number(discount) || 0;
  
  console.log("Product Data:", {
    price: safePrice,
    sellingPrice: safeSellingPrice,
    discount: safeDiscount,
    productId: _id
  });
  
  /* ================= DISCOUNT CALCULATION ================= */
  // Method 1: Direct API se aaya hua discount use karo
  let discountPercentage = safeDiscount;
  let discountAmount = 0;
  let hasRealDiscount = false;
  
  // Method 2: Agar API discount nahi de raha to calculate karo
  if (discountPercentage === 0 && safePrice > 0 && safeSellingPrice < safePrice) {
    // Calculate discount from price difference
    discountAmount = safePrice - safeSellingPrice;
    discountPercentage = Math.round((discountAmount / safePrice) * 100);
  }
  
  // Method 3: Agar API discount de raha hai but price difference nahi match kar raha
  if (discountPercentage > 0) {
    discountAmount = Math.round(safePrice * (discountPercentage / 100));
    // Ensure selling price matches the discount
    const expectedSellingPrice = safePrice - discountAmount;
    if (Math.abs(expectedSellingPrice - safeSellingPrice) > 10) {
      console.warn("Price mismatch, recalculating discount");
      discountAmount = safePrice - safeSellingPrice;
      discountPercentage = Math.round((discountAmount / safePrice) * 100);
    }
  }
  
  // Final check for real discount
  hasRealDiscount = discountPercentage > 0 && safeSellingPrice < safePrice;
  
  console.log("Discount Calculation:", {
    originalPrice: safePrice,
    sellingPrice: safeSellingPrice,
    discountAmount,
    discountPercentage,
    hasRealDiscount
  });
  
  /* ================= CHECK IF PRODUCT IS IN WISHLIST ================= */
  const isInWishlist = wishlistStatus?.[_id] || false;
  const [wishlisted, setWishlisted] = useState(isInWishlist);
  
  useEffect(() => {
    setWishlisted(isInWishlist);
  }, [isInWishlist]);

  /* ================= IMAGE ================= */
  const rawImage =
    image?.url ||
    variants?.[0]?.images?.[0]?.url ||
    "https://images.pexels.com/photos/3801990/pexels-photo-3801990.jpeg";

  const optimizeImg = (url) =>
    url?.replace("/upload/", "/upload/f_auto,q_auto,w_600/");

  const displayImage = optimizeImg(rawImage);

  /* ================= WISHLIST TOGGLE ================= */
  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        title: "Please login first",
        description: "Login to add items to wishlist",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (isToggling) return;

    setIsToggling(true);
    const previousState = wishlisted;
    
    setWishlisted(!wishlisted);
    dispatch(optimisticToggle(_id));

    try {
      const result = await dispatch(toggleWishlist(_id)).unwrap();

      toast({
        title: result.action === "added"
          ? "Added to wishlist ❤️"
          : "Removed from wishlist",
        variant: "default",
      });
    } catch (error) {
      setWishlisted(previousState);
      dispatch(revertOptimisticToggle(_id));
      
      toast({
        title: "Failed to update wishlist",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsToggling(false);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    toast({
      title: "Added to cart!",
      description: `${name} has been added to your cart.`,
      variant: "default",
    });
  };

  /* ================= FORMAT PRICE ================= */
  const formatPrice = (price) => {
    const num = Number(price);
    if (isNaN(num)) return "₹0";
    return `₹${num.toLocaleString('en-IN')}`;
  };

  /* ================= RENDER ================= */
  return (
    <div 
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${_id}`} className="block">
        {/* ===== CARD CONTAINER ===== */}
        <div className="
          relative overflow-hidden rounded-xl
          bg-white
          border border-gray-100
          shadow-md hover:shadow-xl
          transition-all duration-500
          group-hover:-translate-y-1
          hover:border-gray-200
        ">
          {/* ===== DISCOUNT BADGE (Only if real discount) ===== */}
          {hasRealDiscount && (
            <div className="
              absolute top-3 left-3 z-20
              px-3 py-1.5 rounded-full
              text-xs font-bold text-white
              bg-gradient-to-r from-red-500 to-pink-600
              shadow-lg
            ">
              {discountPercentage}% OFF
            </div>
          )}

          {/* ===== WISHLIST BUTTON ===== */}
          <button
            onClick={handleWishlistToggle}
            disabled={isToggling}
            className={`
              absolute top-3 right-3 z-20
              p-2 rounded-full
              bg-white/95 backdrop-blur-sm
              shadow-md hover:shadow-lg
              transition-all duration-300
              ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <Heart
              size={16}
              className={`transition-all duration-200 ${
                wishlisted
                  ? "fill-red-500 text-red-500"
                  : "text-gray-500 group-hover:text-red-400"
              }`}
            />
          </button>

          {/* ===== IMAGE SECTION ===== */}
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Stock Indicator */}
            {totalStock > 0 && totalStock < 5 && (
              <div className="absolute bottom-2 right-2 z-10">
                <div className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {totalStock} left
                </div>
              </div>
            )}

            {/* Product Image */}
            <img
              src={displayImage}
              alt={name}
              loading="lazy"
              className="
                h-full w-full object-cover
                transition-transform duration-700
                group-hover:scale-105
              "
            />

            {/* Hover Overlay */}
            <div className="
              absolute inset-0
              bg-gradient-to-t from-black/10 via-transparent to-transparent
              opacity-0 group-hover:opacity-100
              transition-opacity duration-500
            "/>
          </div>

          {/* ===== PRODUCT INFO ===== */}
          <div className="p-4 space-y-3">
            {/* Product Name */}
            <h3 className="
              text-sm font-semibold text-gray-900
              line-clamp-2 h-10
              group-hover:text-gray-700
              transition-colors duration-300
            ">
              {name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-400">
                {starsGenerator(safeRating)}
              </div>
              <span className="text-xs text-gray-600 font-medium">
                {safeRating.toFixed(1)}
              </span>
              {reviewCount > 0 && (
                <span className="text-xs text-gray-400">
                  ({reviewCount})
                </span>
              )}
            </div>

            {/* ===== PRICE SECTION - CORRECT LOGIC ===== */}
            <div className="space-y-1">
              {hasRealDiscount ? (
                // ✅ WITH DISCOUNT - CORRECTED
                <>
                  <div className="flex items-baseline gap-2">
                    {/* Discounted Price (sellingPrice) */}
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(safeSellingPrice)}
                    </span>
                    
                    {/* Original Price (price) - Striked */}
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(safePrice)}
                    </span>
                  </div>
                  
                  {/* Savings Info */}
                  <div className="text-xs text-gray-500 font-medium">
                    Save {formatPrice(discountAmount)} ({discountPercentage}% off)
                  </div>
                </>
              ) : (
                // WITHOUT DISCOUNT
                <>
                  <div>
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(safePrice)}
                    </span>
                  </div>
                  <div className="h-4"></div> {/* Empty space for alignment */}
                </>
              )}
            </div>

            {/* ===== ADD TO CART BUTTON ===== */}
            <button
              onClick={handleAddToCart}
              className={`
                w-full mt-3 py-2.5 rounded-lg
                text-sm font-medium text-white
                shadow hover:shadow-md
                active:scale-[0.98]
                transition-all duration-200
                ${hasRealDiscount
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700' 
                  : 'bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700'
                }
              `}
            >
              {hasRealDiscount ? 'Grab Deal' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;