import React, { useState, useEffect } from "react";
import { starsGenerator } from "@/constants/helper";
import { toast } from "@/hooks/use-toast";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Star, Clock, Crown } from "lucide-react";
import {
  optimisticToggle,
  revertOptimisticToggle,
  toggleWishlist,
} from "@/redux/slices/wishlistSlice";
import { formatPriceShort } from "@/utils/productCard";
import { formatSoldCount } from "@/constants/siteConfig";

/* ================= BEAUTIFUL PRODUCT CARD ================= */
const ProductCard = ({
  _id,
  name = "Product Title",
  productType = "",
  price = 2000,
  sellingPrice = price,
  discount = 0,
  rating = 0,
  image = null,
  totalStock = 0,
  reviewCount = 0,
  soldCount = 0,
  isNewArrival = false,
  isBestSeller = false,
  isPremium = false,
  colors = [],
  sizes = [],
  selectable = false,
  onSelect,
  hideWishlist = false,
}) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { wishlistStatus } = useSelector((state) => state.wishlist);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isToggling, setIsToggling] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Safe numbers
  const safePrice = Number(price) || 0;
  const safeSellingPrice = Number(sellingPrice) || safePrice;
  const safeRating = Number(rating) || 0;
  const safeDiscount = Number(discount) || 0;

  // Discount calculation
  let discountPercentage = safeDiscount;
  if (discountPercentage === 0 && safePrice > 0 && safeSellingPrice < safePrice) {
    discountPercentage = Math.round(((safePrice - safeSellingPrice) / safePrice) * 100);
  }

  const hasRealDiscount = discountPercentage > 0 && safeSellingPrice < safePrice;
  const soldLabel = formatSoldCount(soldCount);

  // Wishlist state
  const isInWishlist = wishlistStatus?.[_id] || false;
  const [wishlisted, setWishlisted] = useState(isInWishlist);

  useEffect(() => {
    setWishlisted(isInWishlist);
  }, [isInWishlist]);

  // Image optimization
  const rawImage = image?.url || "https://images.pexels.com/photos/3801990/pexels-photo-3801990.jpeg";
  const optimizeImg = (url) => url?.replace("/upload/", "/upload/f_auto,q_auto,w_600/");
  const displayImage = optimizeImg(rawImage);

  // Wishlist toggle
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
        title: result.action === "added" ? "❤️ Added to wishlist" : "💔 Removed from wishlist",
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

  return (
    <div 
      className="group relative h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {selectable ? (
        <button
          type="button"
          onClick={() => onSelect?.()}
          className="block h-full w-full text-left cursor-pointer"
        >
          {renderCard()}
        </button>
      ) : (
        <Link to={`/product/${_id}`} className="block h-full">
          {renderCard()}
        </Link>
      )}
    </div>
  );

  function renderCard() {
    return (
        <div className="overflow-hidden rounded-xl bg-card shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-border hover:border-primary/30">
          
          {/* Image Container */}
          <div className="relative w-full aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
            )}
            
            <img
              src={displayImage}
              alt={name}
              loading="lazy"
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.target.src = "https://images.pexels.com/photos/3801990/pexels-photo-3801990.jpeg";
                setImageLoaded(true);
              }}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isHovered && !selectable ? "scale-105" : "scale-100"
              } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            />

            {/* Badges — spaced row so Premium & discount don't stick together */}
            {(isPremium || isBestSeller || hasRealDiscount) && (
              <div className="absolute top-2 left-2 right-2 z-10 flex max-w-[calc(100%-1rem)] flex-wrap items-start gap-1.5">
                {isPremium && (
                  <span
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-400/80 bg-black/55 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-50 shadow-lg backdrop-blur-md sm:text-[11px]"
                    title="Premium design"
                  >
                    <Crown size={11} className="shrink-0 text-amber-400" strokeWidth={2.25} />
                    Premium
                  </span>
                )}
                {hasRealDiscount && (
                  <span className="inline-flex shrink-0 items-center rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-white shadow-md sm:text-xs">
                    {discountPercentage}% OFF
                  </span>
                )}
                {isBestSeller && (
                  <span className="inline-flex shrink-0 items-center rounded-md bg-gradient-to-r from-amber-500 to-orange-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-md sm:text-xs">
                    Bestseller
                  </span>
                )}
              </div>
            )}

            {/* Wishlist Button - White color */}
            {!hideWishlist && (
            <button
              type="button"
              onClick={handleWishlistToggle}
              disabled={isToggling}
              className={`absolute bottom-2 left-2 z-10 transition-all duration-300 ${
                wishlisted 
                  ? 'text-primary' 
                  : 'text-white hover:text-primary'
              }`}
            >
              <Heart size={20} fill={wishlisted ? "currentColor" : "none"} />
            </button>
            )}

            {/* FLIPKART STYLE RATING - Bottom Right */}
            {safeRating > 0 && (
              <div className="absolute bottom-2 right-2">
                <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded-sm shadow-md">
                  <span className="text-xs font-bold">
                    {safeRating.toFixed(1)}
                  </span>
                  <Star size={10} className="fill-white text-white" />
                  {reviewCount > 0 && (
                    <span className="text-xs text-white/90 ml-0.5">
                      ({reviewCount})
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-4 flex-1 flex flex-col bg-card">
            
            {/* Product Name & Type */}
            <div>
              <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary dark:group-hover:text-primary/80 transition-colors">
                {name}
              </h3>
              {productType && (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {productType}
                </p>
              )}
              {soldLabel && (
                <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                  {soldLabel}
                </p>
              )}
            </div>

            {/* Price Section with Rose Color for Sale Price */}
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-base font-bold text-primary">
                ₹{safeSellingPrice.toLocaleString("en-IN")}
              </span>
              {hasRealDiscount && (
                <span className="text-xs text-muted-foreground line-through">
                  ₹{safePrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {/* Color/Size Indicators */}
            {/* Color/Size Indicators */}
{(colors?.length > 0 || sizes?.length > 0) && (
  <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border">
    {/* Color Swatches */}
    {colors?.length > 0 && (
  <div className="flex items-center gap-1">
    <div className="flex -space-x-1">
      {colors.slice(0, 3).map((color, idx) => (
        <div
          key={idx}
          className="w-3 h-3 rounded-full border-2 border-border shadow-sm transition-transform hover:scale-110 cursor-pointer"
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
    </div>
    {colors.length > 3 && (
      <span className="text-xs text-muted-foreground">
        +{colors.length - 3}
      </span>
    )}
  </div>
)}
    
    {/* Sizes */}
    {sizes?.length > 0 && (
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">
          {sizes.slice(0, 3).join(', ')}
          {sizes.length > 3 && (
            <span className="text-primary text-xs ml-1 font-medium">
              +{sizes.length - 3}
            </span>
          )}
        </span>
      </div>
    )}
  </div>
)}

            {/* Stock Status with Colors */}
            {totalStock > 0 && totalStock <= 5 && (
              <div className="mt-2">
                <span className="text-xs text-warning bg-warning/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Clock size={10} />
                  Only {totalStock} left
                </span>
              </div>
            )}
          </div>
        </div>
    );
  }
};

export default ProductCard;