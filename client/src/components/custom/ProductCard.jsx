import React, { useState, useEffect } from "react";
import { starsGenerator } from "@/constants/helper";
import { toast } from "@/hooks/use-toast";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Eye, ShoppingBag } from "lucide-react";
import {
  optimisticToggle,
  revertOptimisticToggle,
  toggleWishlist,
} from "@/redux/slices/wishlistSlice";

/* ================= SIMPLE PRODUCT CARD (BLACK & WHITE) ================= */
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
  const [showQuickView, setShowQuickView] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Safe numbers
  const safePrice = Number(price) || 0;
  const safeSellingPrice = Number(sellingPrice) || safePrice;
  const safeRating = Number(rating) || 0;
  const safeDiscount = Number(discount) || 0;
  const safeTotalStock = Number(totalStock) || 0;

  // Discount calculation
  let discountPercentage = safeDiscount;
  let discountAmount = 0;

  if (discountPercentage === 0 && safePrice > 0 && safeSellingPrice < safePrice) {
    discountAmount = safePrice - safeSellingPrice;
    discountPercentage = Math.round((discountAmount / safePrice) * 100);
  } else if (discountPercentage > 0 && safePrice > 0) {
    discountAmount = Math.round(safePrice * (discountPercentage / 100));
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
        title: result.action === "added" ? "Added to wishlist" : "Removed from wishlist",
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
    <>
      <div className="group relative h-full">
        <Link to={`/product/${_id}`} className="block h-full">
          <div className="overflow-hidden rounded-xl bg-transparent shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
            {/* Image Container - bada aur thoda long */}
            <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl px-2 pt-2">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
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
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>

            {/* Product Info - left/right padding kam */}
            <div className="px-2 pb-2 pt-1 flex-1 flex flex-col gap-1 bg-transparent">
              {/* Product Name */}
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                {name}
              </h3>
              
              {/* Product Type */}
              {productType && (
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                  {productType}
                </p>
              )}

              {/* Price and rating row */}
              <div className="flex items-start justify-between mt-1 bg-transparent">
                {/* Price section - responsive */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {formatPrice(safeSellingPrice)}
                    </span>
                    {hasRealDiscount && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
                        {formatPrice(safePrice)}
                      </span>
                    )}
                  </div>
                  {/* Discount - mobile me neeche, desktop me side me */}
                  {hasRealDiscount && (
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400 sm:ml-2">
                      {discountPercentage}% off
                    </span>
                  )}
                </div>

                {/* Rating */}
                {safeRating > 0 && (
                  <div className="flex items-center gap-0.5">
                    <span className="text-amber-500 dark:text-amber-400 text-sm">★</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {safeRating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick View Modal */}
      {showQuickView && (
        <QuickViewModal productId={_id} onClose={() => setShowQuickView(false)} />
      )}
    </>
  );
};

/* ================= BLACK & WHITE QUICK VIEW MODAL ================= */
const QuickViewModal = ({ productId, onClose }) => {
  // Aapka original modal code yahan rahega
  return null; // Temporary
};

export default ProductCard;