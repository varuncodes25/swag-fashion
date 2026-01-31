// Product.jsx - FIXED VERSION
import { useNavigate, useParams } from "react-router-dom";
import useBuyNow from "@/hooks/useBuyNow";
import useAddToCart from "@/hooks/useAddToCart";
import useProductDetails from "@/hooks/useProductDetails";

import Breadcrumb from "@/components/Product/Breadcrumb";
import ProductImages from "@/components/Product/ProductImages";
import ProductInfo from "@/components/Product/ProductInfo";
import ProductServices from "@/components/Product/ProductServices";
import ProductVariants from "@/components/Product/ProductVariants";
import ProductActions from "@/components/Product/ProductActions";
import ProductTabs from "@/components/Product/ProductTabs";
import MobileStickyCTA from "@/components/Product/MobileStickyCTA";
import ReviewsComponent from "@/components/custom/ReviewsComponent";
import SimilarProducts from "@/components/Product/SimilarProducts";
import { useState } from "react";

const Product = () => {
  const { productName } = useParams();
  const navigate = useNavigate();

  // ✅ FIX: Correct destructuring from hook
  const {
    product,
    loading,
    quantity,
    setQuantity,
    selectedImage,  // This is an IMAGE OBJECT
    selectedImageIndex, // This is the INDEX
    setSelectedImageIndex, // This sets the INDEX
    color,
    setColor,
    size,
    setSize,
    images,
    displayPrice,
    isOfferActive,
    stock,
    colors,
    sizes,
    selectedVariant,
    getVariantImages,
  } = useProductDetails();

  const { buyNow } = useBuyNow();
  const { handleAddToCart } = useAddToCart();

  const [isMobileZoomOpen, setIsMobileZoomOpen] = useState(false);

  // Child se data receive karne ke liye function
  const handleMobileZoomChange = (isOpen) => {
    console.log("Mobile zoom status:", isOpen);
    setIsMobileZoomOpen(isOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold mb-4">Product Not Found</h2>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Back to Home
        </button>
      </div>
    );
  }

  // ============ FIX: Get images for selected color ============
  const variantImages = getVariantImages ? getVariantImages(color) : images || [];
  console.log("Variant Images:", variantImages);

  // ============ FIX: Handle image selection ============
  const handleImageSelect = (index) => {
    setSelectedImageIndex(index);
  };

  // ============ FIX: Get variant stock ============
  const getVariantStock = () => {
    return selectedVariant?.stock || stock || 0;
  };

  const handleAddToCartClick = () => {
    if (!selectedVariant) {
      alert("Please select color and size");
      return;
    }

    handleAddToCart({
      productId: product._id,
      variantId: selectedVariant._id,
      quantity,
      price: selectedVariant.price || product.price,
      color,
      size,
      variantSku: selectedVariant.sku,
    });
  };

  const handleBuyNowClick = () => {
    if (!selectedVariant) {
      alert("Please select color and size");
      return;
    }

    buyNow({
      productId: product._id,
      variantId: selectedVariant._id,
      quantity,
      variantSku: selectedVariant.sku,
    });
  };

  // ✅ FIX: Handle color change with image reset
  const handleColorChange = (newColor) => {
    setColor(newColor);

    // Get images for new color
    if (getVariantImages) {
      const newColorImages = getVariantImages(newColor);
      console.log("New color images:", newColorImages);

      // Reset to first image of new color
      if (newColorImages && newColorImages.length > 0) {
        // We can't directly set the image object, we need to find its index
        const firstImage = newColorImages[0];
        const imageIndex = newColorImages.findIndex(img =>
          img.url === firstImage.url
        );
        if (imageIndex !== -1) {
          setSelectedImageIndex(imageIndex);
        }
      }
    }
  };

  // ✅ FIX: Check if we have any images to display
  const displayImages = variantImages.length > 0 ? variantImages :
    (product.allImages || []);

  console.log("displayImages", displayImages)

  const currentSelectedImage = selectedImage || displayImages[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb */}
      <Breadcrumb
        category={product.clothingType}
        subcategory={product.gender}
        productName={product.name}
      />

      {/* Main Product Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 lg:p-8 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Images */}
            <ProductImages
              images={variantImages}
              selectedImage={selectedImageIndex} // ✅ Pass INDEX number
              onSelect={setSelectedImageIndex} // ✅ Pass function that sets INDEX
              productName={product.name}
               onMobileZoomChange={handleMobileZoomChange}
            />

            {/* Right Column - Product Info */}
            <div className="space-y-6">
              {/* Basic Info */}
              <ProductInfo
                name={product.name}
                rating={product.rating}
                reviewCount={product.reviewCount}
                soldCount={product.soldCount}
                brand={product.brand}
                price={selectedVariant?.price || product.price}
                displayPrice={displayPrice}
                discount={product.discount}
                isOfferActive={isOfferActive}
              />

              {/* Color Selection */}
              {colors && colors.length > 0 && (
                <ProductVariants
                  colors={colors}
                  selectedColor={color}
                  onColorChange={handleColorChange}
                  sizes={sizes}
                  selectedSize={size}
                  onSizeChange={setSize}
                  sizeGuide={product.sizeGuide}
                  stock={getVariantStock()}
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                  variant={selectedVariant}
                />
              )}

              {/* Services */}
              <ProductServices
                freeDelivery={product.freeShipping}
                deliveryCharge={product.deliveryCharge}
                warranty={product.warranty}
                warrantyType={product.warrantyType}
                returnPolicy={product.returnPolicy}
                returnable={product.returnable}
                stock={getVariantStock()}
              />

              {/* CTA Buttons */}
              <div className="hidden lg:block">
                <ProductActions
                  stock={getVariantStock()}
                  onAddToCart={handleAddToCartClick}
                  onBuyNow={handleBuyNowClick}
                  paymentOptions={product.paymentOptions}
                  highlights={product.features}
                  isVariantSelected={!!selectedVariant}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <ProductTabs product={product} />

        {/* Reviews Section */}
        <ReviewsComponent productId={product._id} product={product} />
      </main>

      {/* Mobile Sticky CTA */}
      {!isMobileZoomOpen && < MobileStickyCTA
        product={product}
      displayPrice={displayPrice}
      isOfferActive={isOfferActive}
      onAddToCart={handleAddToCartClick}
      onBuyNow={handleBuyNowClick}
      isVariantSelected={!!selectedVariant}
      stock={getVariantStock()}
      />}

      <SimilarProducts productId={product._id} />
    </div>
  );
};

export default Product;