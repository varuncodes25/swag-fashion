const round2 = (n) =>
  Math.round((Number(n) + Number.EPSILON) * 100) / 100;

function getVariantSellingPrice(variant, product) {
  const variantSelling = variant?.sellingPrice || 0;
  const productSelling = product?.sellingPrice || 0;
  const variantPrice = variant?.price || 0;
  const productPrice = product?.price || 0;

  return round2(
    variantSelling || productSelling || variantPrice || productPrice || 0,
  );
}

function calculateExchangePricing(originalItem, newProduct, newVariant) {
  const quantity = originalItem.quantity || 1;
  const originalUnitPrice = round2(
    originalItem.finalPrice ??
      originalItem.sellingPrice ??
      originalItem.price ??
      0,
  );
  const originalLineTotal = round2(
    originalItem.lineTotal ?? originalUnitPrice * quantity,
  );
  const newUnitPrice = getVariantSellingPrice(newVariant, newProduct);
  const newLineTotal = round2(newUnitPrice * quantity);
  const priceDifference = round2(newLineTotal - originalLineTotal);
  const extraAmountToPay = round2(Math.max(0, priceDifference));
  const savingsAmount = round2(Math.max(0, -priceDifference));

  return {
    quantity,
    originalUnitPrice,
    originalLineTotal,
    newUnitPrice,
    newLineTotal,
    priceDifference,
    extraAmountToPay,
    savingsAmount,
    paymentRequired: extraAmountToPay > 0,
  };
}

async function resolveExchangeVariant(
  Product,
  { newProductId, newColor, newSize, newVariantId },
) {
  const product = await Product.findById(newProductId);

  if (
    !product ||
    product.blacklisted ||
    product.status !== "published" ||
    product.isVisible === false
  ) {
    throw new Error("Selected product is not available for exchange");
  }

  let variant;
  if (newVariantId) {
    variant = product.variants.id(newVariantId);
  } else {
    if (!newColor || !newSize) {
      throw new Error("Please select color and size for the new product");
    }
    variant = product.getVariant(newColor, newSize);
  }

  if (!variant) {
    throw new Error("Selected variant is not available");
  }

  const availableStock =
    (variant.stock || 0) - (variant.reservedStock || 0);

  return { product, variant, availableStock };
}

function isSameVariant(originalItem, newProductId, newVariant) {
  if (String(originalItem.productId) !== String(newProductId)) {
    return false;
  }

  if (originalItem.variantId && newVariant?._id) {
    return String(originalItem.variantId) === String(newVariant._id);
  }

  return (
    String(originalItem.color || "").toLowerCase() ===
      String(newVariant?.color || "").toLowerCase() &&
    String(originalItem.size || "") === String(newVariant?.size || "")
  );
}

function getProductImage(product, color) {
  if (product.getMainImage && typeof product.getMainImage === "function") {
    const mainImage = product.getMainImage();
    if (mainImage?.url) return mainImage.url;
  }

  if (product.allImages?.length) {
    const colorImage = product.allImages.find(
      (img) => img.color?.toLowerCase() === String(color).toLowerCase(),
    );
    return colorImage?.url || product.allImages[0]?.url || null;
  }

  if (product.images?.length) {
    return product.images[0]?.url || product.images[0] || null;
  }

  return product.image?.url || product.image || null;
}

module.exports = {
  round2,
  getVariantSellingPrice,
  calculateExchangePricing,
  resolveExchangeVariant,
  isSameVariant,
  getProductImage,
};
