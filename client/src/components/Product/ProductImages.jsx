// ProductImages.jsx - MAIN COMPONENT
import { useState } from "react";
import { Share2, Heart } from "lucide-react";
import ProductGallery from "./ProductGallery";
import { useDispatch, useSelector } from "react-redux";
import { optimisticToggle, revertOptimisticToggle, toggleWishlist } from "@/redux/slices/wishlistSlice";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const ProductImages = ({
  images,
  selectedImage,
  onSelect,
  productName,
  id,
   onMobileZoomChange
}) => {
  const [isToggling, setIsToggling] = useState(false);
  
  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { isAuthenticated } = useSelector((state) => state.auth);
const wishlistState = useSelector((state) => state.wishlist);
  const wishlistStatus = wishlistState?.wishlistStatus || {};
  const isWishlisted = wishlistStatus[id] || false;
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
    dispatch(optimisticToggle(id));

    try {
      const result = await dispatch(toggleWishlist(id)).unwrap();

      toast({
        title: result.action === "added"
          ? "Added to wishlist ❤️"
          : "Removed from wishlist",
        variant: "default",
      });
    } catch (error) {
      dispatch(revertOptimisticToggle(id));
      toast({
        title: "Failed to update wishlist",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsToggling(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: productName,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied to clipboard!",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800">
      {/* Product Gallery */}
      <ProductGallery
        images={images}
        selectedImage={selectedImage}
        onSelect={onSelect}
        productName={productName}
         onMobileZoomChange={onMobileZoomChange}
      />

      {/* Quick Actions */}
      <div className="flex items-center gap-3 pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={handleWishlistToggle}
          disabled={isToggling}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
            isWishlisted
              ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
              : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
          } ${isToggling ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {isToggling ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Heart 
              size={20} 
              className={isWishlisted ? "text-red-600 dark:text-red-400" : ""}
              fill={isWishlisted ? "currentColor" : "none"} 
            />
          )}
          <span className="font-medium">
            {isToggling ? "Updating..." : (isWishlisted ? "Wishlisted" : "Add to Wishlist")}
          </span>
        </button>

        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all"
        >
          <Share2 size={20} />
          <span className="font-medium">Share</span>
        </button>
      </div>
    </div>
  );
};

export default ProductImages;