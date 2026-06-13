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
    <div className="lg:bg-background lg:dark:bg-background lg:rounded-xl lg:p-6 lg:shadow-sm lg:border lg:border-gray-100 lg:dark:border-gray-800">
      {/* Product Gallery */}
      <ProductGallery
        images={images}
        selectedImage={selectedImage}
        onSelect={onSelect}
        productName={productName}
         onMobileZoomChange={onMobileZoomChange}
      />

      {/* Quick Actions */}
      <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3 lg:mt-6 lg:gap-3 lg:pt-6 dark:border-gray-800">
  <button
    onClick={handleWishlistToggle}
    disabled={isToggling}
    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-2 transition-all active:scale-[0.98] lg:gap-2 lg:rounded-xl lg:px-4 lg:py-3 ${
      isWishlisted
        ? "border-red-200 bg-gradient-to-r from-red-50 to-pink-50 text-destructive shadow-sm dark:border-red-800 dark:from-red-900/30 dark:to-pink-900/30 lg:border-2 lg:shadow-md"
        : "border-border bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 shadow-sm dark:from-gray-800 dark:to-gray-700 dark:text-gray-300 lg:border-2 lg:hover:from-gray-100 lg:hover:to-gray-200"
    } ${isToggling ? "cursor-not-allowed opacity-70" : ""}`}
  >
    {isToggling ? (
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent lg:h-5 lg:w-5" />
    ) : (
      <>
        <Heart
          className={`h-4 w-4 transition-all lg:h-[22px] lg:w-[22px] ${
            isWishlisted ? "scale-110 text-destructive" : "text-muted-foreground"
          }`}
          fill={isWishlisted ? "currentColor" : "none"}
        />
        <span className="hidden font-medium sm:inline">
          {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
        </span>
        <span className="text-xs font-medium sm:hidden">
          {isWishlisted ? "Saved" : "Save"}
        </span>
      </>
    )}
  </button>

  <button
    onClick={handleShare}
    className="group flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary/25 bg-gradient-to-r from-blue-50 to-indigo-50 px-2 py-2 shadow-sm transition-all active:scale-[0.98] dark:border-primary/30 dark:from-blue-900/30 dark:to-indigo-900/30 lg:gap-2 lg:rounded-xl lg:border-2 lg:px-4 lg:py-3 lg:shadow-md lg:hover:from-blue-100 lg:hover:to-indigo-100"
  >
    <Share2 className="h-4 w-4 text-primary transition-transform group-hover:rotate-12 dark:text-primary lg:h-[22px] lg:w-[22px]" />
    <span className="hidden font-medium sm:inline">Share</span>
    <span className="text-xs font-medium sm:hidden">Share</span>
  </button>
</div>
    </div>
  );
};

export default ProductImages;