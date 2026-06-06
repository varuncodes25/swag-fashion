// useProductDetails.js
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  preloadImageUrls,
  resolveImagesForColor,
} from "@/utils/productImages";

const productCache = new Map();
const CACHE_MAX = 40;

function readCache(id) {
  return productCache.get(id) || null;
}

function writeCache(id, data) {
  if (productCache.has(id)) productCache.delete(id);
  productCache.set(id, data);
  while (productCache.size > CACHE_MAX) {
    const oldest = productCache.keys().next().value;
    productCache.delete(oldest);
  }
}

function applyInitialVariantState(data, setters) {
  const { setColor, setSize, setSelectedVariant } = setters;
  if (!data?.colors?.length) return;

  const firstColor = data.colors[0];
  setColor(firstColor);

  const sizesForFirstColor = getSizesForColor(data, firstColor);
  if (sizesForFirstColor.length > 0) {
    const firstSize = sizesForFirstColor[0];
    setSize(firstSize);
    setSelectedVariant(findVariant(data, firstColor, firstSize));
  }
}

const getSizesForColor = (productData, colorName) => {
  if (!productData?.variants) return [];

  const uniqueSizes = [];
  productData.variants.forEach((v) => {
    if (v.color === colorName && !uniqueSizes.includes(v.size)) {
      uniqueSizes.push(v.size);
    }
  });

  return uniqueSizes;
};

const findVariant = (productData, colorName, sizeName) => {
  if (!productData?.variants) return null;
  return productData.variants.find(
    (v) => v.color === colorName && v.size === sizeName,
  );
};

const useProductDetails = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [imagebycolor, setImageByColor] = useState(null);
  const [clothingType, setClothingType] = useState(null);
  const { productId } = useParams();

  useEffect(() => {
    let cancelled = false;

    setSelectedImageIndex(0);
    setQuantity(1);
    setColor("");
    setSize("");
    setSelectedVariant(null);

    const hydrateProduct = (data) => {
      setProduct(data);
      setImageByColor(data.imagesByColor);
      setClothingType(data.clothingType);
      applyInitialVariantState(data, {
        setColor,
        setSize,
        setSelectedVariant,
      });
      preloadImageUrls(data.allImages || []);
    };

    const fetchProduct = async () => {
      const cached = readCache(productId);
      if (cached) {
        hydrateProduct(cached);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/get-product-by-id/${productId}`,
        );

        if (cancelled) return;

        if (res.data.success) {
          const data = res.data.data;
          writeCache(productId, data);
          hydrateProduct(data);
        }
      } catch (error) {
        if (!cancelled) console.error("Failed to fetch product:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (productId) fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const getImagesByColor = (colorName) =>
    resolveImagesForColor(product, colorName);

  const handleColorChange = (newColor) => {
    setColor(newColor);
    setSelectedImageIndex(0);

    const newImages = resolveImagesForColor(product, newColor);
    preloadImageUrls(newImages);

    const availableSizes = getSizesForColor(product, newColor);
    if (availableSizes.length > 0) {
      const firstSize = availableSizes[0];
      setSize(firstSize);
      setSelectedVariant(findVariant(product, newColor, firstSize));
    } else {
      setSize("");
      setSelectedVariant(null);
    }
  };

  const handleSizeChange = (newSize) => {
    setSize(newSize);
    setSelectedVariant(findVariant(product, color, newSize));
  };

  const currentImages = getImagesByColor(color);

  const selectedImage =
    currentImages[selectedImageIndex] || currentImages[0] || product?.image || null;

  const stock = selectedVariant?.stock || product?.totalStock || 0;

  const isOfferActive = product?.isOfferActive || false;
  const basePrice = selectedVariant?.price || product?.price || 0;
  const displayPrice =
    isOfferActive && product?.discount > 0
      ? (basePrice * (100 - product.discount)) / 100
      : basePrice;

  const colors = product?.colors || [];
  const sizes = getSizesForColor(product, color);

  return {
    product,
    imagebycolor,
    loading,
    quantity,
    setQuantity,
    selectedImage,
    selectedImageIndex,
    setSelectedImageIndex,
    color,
    setColor: handleColorChange,
    size,
    setSize: handleSizeChange,
    images: currentImages,
    displayPrice,
    isOfferActive,
    stock,
    colors,
    sizes,
    selectedVariant,
    getVariantImages: getImagesByColor,
  };
};

export default useProductDetails;
