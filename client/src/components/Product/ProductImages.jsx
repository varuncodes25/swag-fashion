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
    <div className="bg-background dark:bg-background rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800">
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
  
  {/* Wishlist Button - Mobile pe sirf icon, desktop pe icon+text */}
  <button
    onClick={handleWishlistToggle}
    disabled={isToggling}
    className={`flex-1 flex items-center justify-center gap-2 px-2 sm:px-4 py-3 rounded-xl transition-all duration-300 transform active:scale-95 ${
      isWishlisted
        ? "bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 text-destructive border-2 border-red-200 dark:border-red-800 shadow-md"
        : "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 border-2 border-border shadow-sm hover:shadow-md"
    } ${isToggling ? "opacity-70 cursor-not-allowed" : ""}`}
  >
    {isToggling ? (
      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
    ) : (
      <>
        <Heart 
          size={22} 
          className={`transition-all duration-300 ${
            isWishlisted 
              ? "text-destructive scale-110" 
              : "text-muted-foreground"
          }`}
          fill={isWishlisted ? "currentColor" : "none"} 
        />
        {/* Desktop Text - Hidden on mobile */}
        <span className="hidden sm:inline font-medium">
          {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
        </span>
        {/* Mobile Text - Very short */}
        <span className="sm:hidden text-xs font-medium">
          {isWishlisted ? "Saved" : "Save"}
        </span>
      </>
    )}
  </button>

  {/* Share Button - Mobile pe sirf icon, desktop pe icon+text */}
  <button
    onClick={handleShare}
    className="flex-1 flex items-center justify-center gap-2 px-2 sm:px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-primary dark:text-primary hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/40 dark:hover:to-indigo-800/40 border-2 border-primary/25 dark:border-primary/30 shadow-sm hover:shadow-md transition-all duration-300 transform active:scale-95 group"
  >
    <Share2 
      size={22} 
      className="group-hover:rotate-12 transition-transform duration-300 text-primary dark:text-primary" 
    />
    {/* Desktop Text - Hidden on mobile */}
    <span className="hidden sm:inline font-medium">Share</span>
    {/* Mobile Text - Very short */}
    <span className="sm:hidden text-xs font-medium">Share</span>
  </button>
</div>
    </div>
  );
};

export default ProductImages;