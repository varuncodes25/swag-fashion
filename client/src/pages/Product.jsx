import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useBuyNow from "@/hooks/useBuyNow";
import useAddToCart from "@/hooks/useAddToCart";
import useProductDetails from "@/hooks/useProductDetails";

import Breadcrumb from "@/components/Product/Breadcrumb";
import ProductImages from "@/components/Product/ProductImages";
import ProductInfo from "@/components/Product/ProductInfo";
import ProductVariants from "@/components/Product/ProductVariants";
import ProductActions from "@/components/Product/ProductActions";
import ProductTabs from "@/components/Product/ProductTabs";
import MobileStickyCTA from "@/components/Product/MobileStickyCTA";
import ReviewsComponent from "@/components/custom/ReviewsComponent";
import SimilarProducts from "@/components/Product/SimilarProducts";
import DeliveryChecker from "@/components/Product/DeliveryChecker";
import { applyJsonLd, applySeoMeta, getCanonicalFromPath } from "@/utils/seo";

/**
 * Heavy UI + SEO effect only mount after product is resolved.
 * Avoids hook-order mismatches across loading / not-found transitions on the shell.
 */
function ProductLoaded({
  productId,
  detail,
  addToCart,
  cartLoading,
  buyNow,
  isMobileZoomOpen,
  onMobileZoomChange,
}) {
  const {
    product,
    imagebycolor,
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
  } = detail;

  const variantImages =
    product && getVariantImages ? getVariantImages(color) : images || [];

  const displayImages =
    variantImages.length > 0 ? variantImages : product?.allImages || [];

  const getVariantStock = () => selectedVariant?.stock || stock || 0;

  const norm = (s) => String(s ?? "").trim().toLowerCase();
  const variantsForSelectedColor = (product?.variants || []).filter(
    (v) => norm(v.color) === norm(color) && norm(v.color).length > 0
  );

  useEffect(() => {
    const productName = product?.name || "Product";
    const brand = product?.brand || "Swag Fashion";
    const title = `${productName} | ${brand} | Swag Fashion`;
    const description =
      (product?.description || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 155) || `${productName} by ${brand} at Swag Fashion.`;
    const ogImage =
      displayImages?.[0]?.url ||
      product?.image?.url ||
      product?.allImages?.[0]?.url;

    applySeoMeta({
      title,
      description,
      canonical: getCanonicalFromPath(`/product/${productId}`),
      ogImage,
    });

    const canonicalUrl = getCanonicalFromPath(`/product/${productId}`);
    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: productName,
      image: displayImages?.map((img) => img?.url).filter(Boolean) || [],
      description,
      brand: {
        "@type": "Brand",
        name: brand,
      },
      sku: product?._id || productId,
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        price: String(displayPrice || product?.price || 0),
        availability:
          (selectedVariant?.stock || stock || 0) > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        url: canonicalUrl,
      },
      aggregateRating:
        product?.rating && product?.reviewCount
          ? {
              "@type": "AggregateRating",
              ratingValue: String(product.rating),
              reviewCount: String(product.reviewCount),
            }
          : undefined,
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: getCanonicalFromPath("/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: product?.gender || "Category",
          item: getCanonicalFromPath(
            `/category/${(product?.gender || "all").toLowerCase()}`
          ),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: productName,
          item: canonicalUrl,
        },
      ],
    };

    applyJsonLd("product", productSchema);
    applyJsonLd("product-breadcrumb", breadcrumbSchema);
  }, [
    product,
    productId,
    displayImages,
    displayPrice,
    selectedVariant,
    stock,
    color,
  ]);

  const handleAddToCartClick = async () => {
    if (!selectedVariant) {
      alert("Please select color and size");
      return;
    }

    try {
      const result = await addToCart({
        productId: product._id,
        variantId: selectedVariant._id,
        quantity,
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

  const handleBuyNowClick = () => {
    if (!selectedVariant) {
      alert("Please select color and size");
      return;
    }

    buyNow({
      productId: product._id,
      variantId: selectedVariant._id,
      quantity,
      color: selectedVariant.color,
      size: selectedVariant.size,
    });
  };

  const handleColorChange = (newColor) => {
    setColor(newColor);

    if (getVariantImages) {
      const newColorImages = getVariantImages(newColor);

      if (newColorImages && newColorImages.length > 0) {
        setSelectedImageIndex(0);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-black  ">
      <Breadcrumb
        category={product.category}
        clothingType={product.clothingType}
        gender={product.gender}
        productName={product.name}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-background dark:bg-background rounded-xl shadow-sm p-4 sm:p-6 lg:p-8 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <ProductImages
              images={variantImages}
              selectedImage={selectedImageIndex}
              onSelect={setSelectedImageIndex}
              productName={product.name}
              id={productId}
              onMobileZoomChange={onMobileZoomChange}
            />

            <div className="space-y-6">
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
                  clothingType={product.clothingType}
                  variantsForSizeChart={variantsForSelectedColor}
                  sizesOrder={sizes}
                />
              )}
              <DeliveryChecker />

              <div className="hidden lg:block">
                <ProductActions
                  stock={getVariantStock()}
                  onAddToCart={handleAddToCartClick}
                  onBuyNow={handleBuyNowClick}
                  paymentOptions={product.paymentOptions}
                  highlights={product.features}
                  isVariantSelected={!!selectedVariant}
                  loading={cartLoading}
                />
              </div>
            </div>
          </div>
        </div>

        <ProductTabs product={product} />

        <ReviewsComponent productId={product._id} product={product} />
      </main>

      {!isMobileZoomOpen && (
        <MobileStickyCTA
          product={product}
          displayPrice={displayPrice}
          isOfferActive={isOfferActive}
          onAddToCart={handleAddToCartClick}
          onBuyNow={handleBuyNowClick}
          isVariantSelected={!!selectedVariant}
          stock={getVariantStock()}
          loading={cartLoading}
        />
      )}

      <SimilarProducts
        productId={product._id}
        category={product.category}
        gender={product.gender}
        clothingType={product.clothingType}
      />
    </div>
  );
}

const Product = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const { addToCart, loading: cartLoading } = useAddToCart();
  const { buyNow } = useBuyNow();
  const detail = useProductDetails();
  const { product, loading: productLoading } = detail;

  const [isMobileZoomOpen, setIsMobileZoomOpen] = useState(false);

  const handleMobileZoomChange = (isOpen) => setIsMobileZoomOpen(isOpen);

  if (productLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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

  return (
    <ProductLoaded
      key={product._id || productId}
      productId={productId}
      detail={detail}
      addToCart={addToCart}
      cartLoading={cartLoading}
      buyNow={buyNow}
      isMobileZoomOpen={isMobileZoomOpen}
      onMobileZoomChange={handleMobileZoomChange}
    />
  );
};

export default Product;
