import React, { useState, useEffect } from "react";
import { starsGenerator } from "@/constants/helper";
import { toast } from "@/hooks/use-toast";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Eye, ShoppingBag, Star, TrendingUp, Clock } from "lucide-react";
import {
  optimisticToggle,
  revertOptimisticToggle,
  toggleWishlist,
} from "@/redux/slices/wishlistSlice";
import { formatPriceShort } from "@/utils/productCard";

/* ================= BEAUTIFUL PRODUCT CARD ================= */
const ProductCard = ({
  _id,
  name = "Product Title",
  productType = "",
  price = 2000,
  sellingPrice = price,
  discount = 0,
  rating = 4,
  image = null,
  totalStock = 0,
  reviewCount = 0,
  isNewArrival = false,
  isBestSeller = false,
  colors = [],
  sizes = []
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

  const formatPrice = (price) => {
    const num = Number(price);
    if (isNaN(num)) return "₹0";
    return `₹${num.toLocaleString("en-IN")}`;
  };

  return (
    <div 
      className="group relative h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${_id}`} className="block h-full">
        <div className="overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col border border-gray-100 dark:border-gray-800">
          
          {/* Image Container */}
          <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-50 dark:bg-gray-800">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse" />
            )}
            
            <img
              src={displayImage}
              alt={name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.target.src = "https://images.pexels.com/photos/3801990/pexels-photo-3801990.jpeg";
                setImageLoaded(true);
              }}
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isHovered ? 'scale-110' : 'scale-100'
              } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {isNewArrival && (
                <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full shadow-lg backdrop-blur-sm bg-opacity-90 flex items-center gap-1">
                  <Clock size={12} />
                  New
                </span>
              )}
              {isBestSeller && (
                <span className="px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full shadow-lg backdrop-blur-sm bg-opacity-90 flex items-center gap-1">
                  <TrendingUp size={12} />
                  Best Seller
                </span>
              )}
            </div>

            {/* Discount Badge */}
            {hasRealDiscount && (
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                  {discountPercentage}% OFF
                </span>
              </div>
            )}

            {/* Wishlist Button */}
            <button
              onClick={handleWishlistToggle}
              disabled={isToggling}
              className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 transform ${
                isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              } ${
                wishlisted 
                  ? 'bg-red-500 text-white shadow-lg' 
                  : 'bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 backdrop-blur-sm hover:bg-red-500 hover:text-white'
              }`}
            >
              <Heart size={16} fill={wishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Product Info */}
          <div className="p-3 flex-1 flex flex-col gap-2">
            
            {/* Product Name & Type */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {name}
              </h3>
              {productType && (
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                  {productType}
                </p>
              )}
            </div>

            {/* Price Section */}
            <div className="flex items-center justify-between gap-1">
  {/* Price section */}
  <div className="flex items-baseline gap-1 sm:gap-2">
    <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
      {formatPriceShort(safeSellingPrice)}
    </span>
    {hasRealDiscount && (
      <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 line-through">
        {formatPriceShort(safePrice)}
      </span>
    )}
  </div>

  {/* Rating - Flipkart Style with formatted numbers */}
  {safeRating > 0 && (
    <div className="flex items-center gap-1 h-5 shrink-0">
      {/* Rating number with star */}
      <div className="flex items-center gap-0.5">
        <span className="text-xs font-semibold text-gray-900 dark:text-white">
          {safeRating.toFixed(1)}
        </span>
        <Star size={12} className="text-green-500 fill-green-500" />
      </div>
      
      {/* Ratings count - formatted */}
      {/* {reviewCount > 0 && (
        <span className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
          ({reviewCount >= 1000 
            ? (reviewCount/1000).toFixed(1) + 'k' 
            : reviewCount})
        </span>
      )} */}
    </div>
  )}
</div>


            {/* Color/Size Indicators */}
            {(colors?.length > 0 || sizes?.length > 0) && (
              <div className="flex items-center gap-2 mt-1">
                {colors?.length > 0 && (
                  <div className="flex -space-x-1">
                    {colors.slice(0, 3).map((color, idx) => (
                      <div
                        key={idx}
                        className="w-4 h-4 rounded-full border border-white dark:border-gray-800 shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    {colors.length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        +{colors.length - 3}
                      </span>
                    )}
                  </div>
                )}
                {sizes?.length > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {sizes.slice(0, 3).join(', ')}
                    {sizes.length > 3 && ' +more'}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;