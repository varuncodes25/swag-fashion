// Product.jsx - CORRECTED VERSION
import { useNavigate, useParams } from "react-router-dom";
import useBuyNow from "@/hooks/useBuyNow";
import useAddToCart from "@/hooks/useAddToCart"; // ✅ Single import
import useProductDetails from "@/hooks/useProductDetails";

import Breadcrumb from "@/components/Product/Breadcrumb";
import ProductImages from "@/components/Product/ProductImages";
import ProductInfo from "@/components/Product/ProductInfo";
// import ProductServices from "@/components/Product/ProductServices";
import ProductVariants from "@/components/Product/ProductVariants";
import ProductActions from "@/components/Product/ProductActions";
import ProductTabs from "@/components/Product/ProductTabs";
import MobileStickyCTA from "@/components/Product/MobileStickyCTA";
import ReviewsComponent from "@/components/custom/ReviewsComponent";
import SimilarProducts from "@/components/Product/SimilarProducts";
import { useState } from "react";

const Product = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  // ✅ Custom hooks
  const { addToCart, loading: cartLoading } = useAddToCart(); // ✅ Rename loading
  const { buyNow } = useBuyNow();

  // ✅ Product details hook
  const {
    product,
    imagebycolor,
    loading: productLoading, // ✅ Rename loading
    quantity,
    setQuantity,
    selectedImageIndex,
    setSelectedImageIndex,
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

  const [isMobileZoomOpen, setIsMobileZoomOpen] = useState(false);

  // ✅ Handle mobile zoom
  const handleMobileZoomChange = (isOpen) => {
    console.log("Mobile zoom status:", isOpen);
    setIsMobileZoomOpen(isOpen);
  };

  // ✅ Add to Cart Function
  const handleAddToCartClick = async () => {
    if (!selectedVariant) {
      alert("Please select color and size");
      return;
    }

    try {
      const result = await addToCart({
        productId: product._id,
        variantId: selectedVariant._id,
        quantity: quantity,
        productName: product.name,
        variantColor: selectedVariant.color,
      });

      if (result.success) {
        console.log("Added successfully!");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
    }
  };

  // ✅ Buy Now Function
  const handleBuyNowClick = () => {
    if (!selectedVariant) {
      alert("Please select color and size");
      return;
    }

      buyNow({
    productId: product._id,
    variantId: selectedVariant._id, // ✅ CORRECT!
    quantity,
    color: selectedVariant.color, // ✅ Add color
    size: selectedVariant.size,   // ✅ Add size
  });

  };

  // ✅ Handle color change
  const handleColorChange = (newColor) => {
    setColor(newColor);

    if (getVariantImages) {
      const newColorImages = getVariantImages(newColor);
      console.log("New color images:", newColorImages);

      if (newColorImages && newColorImages.length > 0) {
        // Reset to first image of new color
        setSelectedImageIndex(0);
      }
    }
  };

  // ✅ Loading state
  if (productLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ✅ Product not found
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

  // ✅ Get variant images
  const variantImages = getVariantImages
    ? getVariantImages(color)
    : images || [];
  console.log("Variant Images:", variantImages);

  // ✅ Get variant stock
  const getVariantStock = () => {
    return selectedVariant?.stock || stock || 0;
  };

  // ✅ Display images
  const displayImages =
    variantImages.length > 0 ? variantImages : product.allImages || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background ">
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
              selectedImage={selectedImageIndex}
              onSelect={setSelectedImageIndex}
              productName={product.name}
              id={productId}
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
                  imagebycolor={imagebycolor}
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
              {/* <ProductServices
                freeDelivery={product.freeShipping}
                deliveryCharge={product.deliveryCharge}
                warranty={product.warranty}
                warrantyType={product.warrantyType}
                returnPolicy={product.returnPolicy}
                returnable={product.returnable}
                stock={getVariantStock()}
              /> */}

              {/* CTA Buttons */}
              <div className="hidden lg:block">
                <ProductActions
                  stock={getVariantStock()}
                  onAddToCart={handleAddToCartClick}
                  onBuyNow={handleBuyNowClick}
                  paymentOptions={product.paymentOptions}
                  highlights={product.features}
                  isVariantSelected={!!selectedVariant}
                  loading={cartLoading} // ✅ Pass loading state
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
      {!isMobileZoomOpen && (
        <MobileStickyCTA
          product={product}
          displayPrice={displayPrice}
          isOfferActive={isOfferActive}
          onAddToCart={handleAddToCartClick}
          onBuyNow={handleBuyNowClick}
          isVariantSelected={!!selectedVariant}
          stock={getVariantStock()}
          loading={cartLoading} // ✅ Pass loading state
        />
      )}

      <SimilarProducts productId={product._id} />
    </div>
  );
};

export default Product;
