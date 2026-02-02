import React, { useState, useEffect } from "react";
import { starsGenerator } from "@/constants/helper";
import { toast } from "@/hooks/use-toast";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Eye } from "lucide-react";
import {
  optimisticToggle,
  revertOptimisticToggle,
  toggleWishlist,
} from "@/redux/slices/wishlistSlice";

/* ================= PRODUCT CARD ================= */
const ProductCard = ({
  _id,
  name = "Product Title",
  
  // ✅ API से मिलने वाले data
  price = 2000,            // Original/MRP Price
  sellingPrice = price,    // Discounted Price
  discount = 0,            // Discount percentage
  
  rating = 4,
  image = null,
  totalStock = 0,
  reviewCount = 0,
  
  // ✅ New props for better UX
  isFeatured = false,
  isNewArrival = false,
  isBestSeller = false,
  freeShipping = false,
  colors = [],
  sizes = []
}) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { wishlistStatus } = useSelector((state) => state.wishlist);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [isToggling, setIsToggling] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  /* ================= SAFE NUMBER HANDLING ================= */
  const safePrice = Number(price) || 0;
  const safeSellingPrice = Number(sellingPrice) || safePrice;
  const safeRating = Number(rating) || 0;
  const safeDiscount = Number(discount) || 0;
  const safeTotalStock = Number(totalStock) || 0;
  
  /* ================= DISCOUNT CALCULATION ================= */
  // Calculate actual discount from price difference
  let discountPercentage = safeDiscount;
  let discountAmount = 0;
  
  // If discount is 0 but selling price is less than price, calculate discount
  if (discountPercentage === 0 && safePrice > 0 && safeSellingPrice < safePrice) {
    discountAmount = safePrice - safeSellingPrice;
    discountPercentage = Math.round((discountAmount / safePrice) * 100);
  } 
  // If discount is provided, calculate discount amount
  else if (discountPercentage > 0 && safePrice > 0) {
    discountAmount = Math.round(safePrice * (discountPercentage / 100));
  }
  
  const hasRealDiscount = discountPercentage > 0 && safeSellingPrice < safePrice;
  
  /* ================= CHECK IF PRODUCT IS IN WISHLIST ================= */
  const isInWishlist = wishlistStatus?.[_id] || false;
  const [wishlisted, setWishlisted] = useState(isInWishlist);
  
  useEffect(() => {
    setWishlisted(isInWishlist);
  }, [isInWishlist]);

  /* ================= IMAGE ================= */
  const rawImage = image?.url || "https://images.pexels.com/photos/3801990/pexels-photo-3801990.jpeg";
  
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

  /* ================= VIEW DETAILS ================= */
  const handleViewDetails = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${_id}`);
  };

  /* ================= QUICK VIEW ================= */
  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  /* ================= FORMAT PRICE ================= */
  const formatPrice = (price) => {
    const num = Number(price);
    if (isNaN(num)) return "₹0";
    return `₹${num.toLocaleString('en-IN')}`;
  };

  /* ================= RENDER ================= */
  return (
    <>
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
            {/* ===== BADGES SECTION ===== */}
            <div className="absolute top-3 left-3 z-20 flex flex-col gap-1">
              {/* DISCOUNT BADGE */}
              {hasRealDiscount && (
                <div className="
                  px-3 py-1.5 rounded-full
                  text-xs font-bold text-white
                  bg-gradient-to-r from-red-500 to-pink-600
                  shadow-lg
                ">
                  {discountPercentage}% OFF
                </div>
              )}
              
              {/* NEW ARRIVAL BADGE */}
              {isNewArrival && (
                <div className="
                  px-3 py-1.5 rounded-full
                  text-xs font-bold text-white
                  bg-gradient-to-r from-blue-500 to-purple-600
                  shadow-lg
                ">
                  NEW
                </div>
              )}
              
              {/* BEST SELLER BADGE */}
              {isBestSeller && (
                <div className="
                  px-3 py-1.5 rounded-full
                  text-xs font-bold text-white
                  bg-gradient-to-r from-amber-500 to-orange-600
                  shadow-lg
                ">
                  BESTSELLER
                </div>
              )}
            </div>

            {/* ===== ACTION BUTTONS ===== */}
            <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
              {/* WISHLIST BUTTON */}
              <button
                onClick={handleWishlistToggle}
                disabled={isToggling}
                className={`
                  p-2 rounded-full
                  bg-white/95 backdrop-blur-sm
                  shadow-md hover:shadow-lg
                  transition-all duration-300
                  ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
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

              {/* QUICK VIEW BUTTON (Shows on hover) */}
              {isHovered && (
                <button
                  onClick={handleQuickView}
                  className="
                    p-2 rounded-full
                    bg-white/95 backdrop-blur-sm
                    shadow-md hover:shadow-lg
                    transition-all duration-300
                  "
                  aria-label="Quick view"
                >
                  <Eye size={16} className="text-gray-500 group-hover:text-gray-700" />
                </button>
              )}
            </div>

            {/* ===== IMAGE SECTION ===== */}
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
              {/* STOCK INDICATOR */}
              {safeTotalStock > 0 && safeTotalStock < 5 && (
                <div className="absolute bottom-2 right-2 z-10">
                  <div className="px-2 py-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                    Only {safeTotalStock} left
                  </div>
                </div>
              )}

              {/* OUT OF STOCK OVERLAY */}
              {safeTotalStock === 0 && (
                <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
                  <div className="px-4 py-2 bg-white/90 rounded-full text-sm font-bold">
                    Out of Stock
                  </div>
                </div>
              )}

              {/* PRODUCT IMAGE */}
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

              {/* HOVER OVERLAY */}
              <div className="
                absolute inset-0
                bg-gradient-to-t from-black/10 via-transparent to-transparent
                opacity-0 group-hover:opacity-100
                transition-opacity duration-500
              "/>
            </div>

            {/* ===== PRODUCT INFO ===== */}
            <div className="p-4 space-y-3">
              {/* PRODUCT NAME */}
              <h3 className="
                text-sm font-semibold text-gray-900
                line-clamp-2 h-10
                group-hover:text-gray-700
                transition-colors duration-300
              ">
                {name}
              </h3>

              {/* FREE SHIPPING BADGE */}
              {freeShipping && (
                <div className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                  FREE SHIPPING
                </div>
              )}

              {/* RATING */}
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

              {/* ===== PRICE SECTION ===== */}
              <div className="space-y-1">
                {hasRealDiscount ? (
                  // WITH DISCOUNT
                  <>
                    <div className="flex items-baseline gap-2">
                      {/* DISCOUNTED PRICE */}
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(safeSellingPrice)}
                      </span>
                      
                      {/* ORIGINAL PRICE - Striked */}
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(safePrice)}
                      </span>
                    </div>
                    
                    {/* SAVINGS INFO */}
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

              {/* ===== VARIANT INFO ===== */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {colors.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span>{colors.length} color{colors.length > 1 ? 's' : ''}</span>
                  </div>
                )}
                
                {sizes.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span>•</span>
                    <span>{sizes.length} size{sizes.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>

              {/* ===== VIEW DETAILS BUTTON (INSTEAD OF ADD TO CART) ===== */}
              <button
                onClick={handleViewDetails}
                className={`
                  w-full mt-3 py-2.5 rounded-lg
                  text-sm font-medium text-white
                  shadow hover:shadow-md
                  active:scale-[0.98]
                  transition-all duration-200
                  ${safeTotalStock === 0 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : hasRealDiscount
                      ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700' 
                      : 'bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700'
                  }
                `}
                disabled={safeTotalStock === 0}
              >
                {safeTotalStock === 0 
                  ? 'Out of Stock' 
                  : hasRealDiscount 
                    ? 'View Details & Save' 
                    : 'View Details'
                }
              </button>
            </div>
          </div>
        </Link>
      </div>

      {/* ===== QUICK VIEW MODAL ===== */}
      {showQuickView && (
        <QuickViewModal
          productId={_id}
          onClose={() => setShowQuickView(false)}
        />
      )}
    </>
  );
};

/* ================= QUICK VIEW MODAL COMPONENT ================= */
const QuickViewModal = ({ productId, onClose }) => {
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch product details for quick view
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/products/${productId}/quick-view`);
        const data = await response.json();
        setProduct(data);
        if (data.colors?.length > 0) setSelectedColor(data.colors[0]);
        if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      toast({
        title: "Please select variant",
        description: "Choose color and size before adding to cart",
        variant: "destructive",
      });
      return;
    }

    // Add to cart logic here
    toast({
      title: "Added to cart!",
      description: `${product.name} (${selectedColor}, ${selectedSize}) added to cart`,
      variant: "default",
    });
    
    onClose();
  };

  const handleViewFullDetails = () => {
    navigate(`/product/${productId}`);
    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg">
          Loading...
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* IMAGE SECTION */}
          <div className="p-6">
            <img
              src={product.image?.url}
              alt={product.name}
              className="w-full rounded-lg"
            />
          </div>

          {/* DETAILS SECTION */}
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{product.name}</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* PRICE */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-bold">₹{product.sellingPrice}</span>
                {product.discount > 0 && (
                  <>
                    <s className="text-gray-500">₹{product.price}</s>
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
                      {product.discount}% OFF
                    </span>
                  </>
                )}
              </div>
              {product.discount > 0 && (
                <p className="text-green-600 text-sm">
                  Save ₹{product.price - product.sellingPrice}
                </p>
              )}
            </div>

            {/* VARIANT SELECTION */}
            <div className="space-y-4 mb-6">
              {/* COLOR SELECTION */}
              <div>
                <h3 className="font-semibold mb-2">Color</h3>
                <div className="flex gap-2 flex-wrap">
                  {product.colors?.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded border ${
                        selectedColor === color
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-black'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* SIZE SELECTION */}
              <div>
                <h3 className="font-semibold mb-2">Size</h3>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes?.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded border ${
                        selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* QUANTITY */}
              <div>
                <h3 className="font-semibold mb-2">Quantity</h3>
                <div className="flex items-center border rounded w-fit">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-4 py-2"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="px-4 py-2"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                className="w-full bg-black text-white py-3 rounded font-semibold hover:bg-gray-800"
              >
                Add to Cart - ₹{product.sellingPrice * quantity}
              </button>
              
              <button
                onClick={handleViewFullDetails}
                className="w-full border border-gray-300 py-3 rounded font-semibold hover:bg-gray-50"
              >
                View Full Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;