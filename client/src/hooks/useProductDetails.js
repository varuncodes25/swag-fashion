// useProductDetails.js
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const useProductDetails = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  

 const { productId } = useParams(); // ✅ Change from productName to productId

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/get-product-by-id/${productId}` // ✅ Change endpoint
        );
        
        if (res.data.success) {
          const data = res.data.data;
          setProduct(data);

          if (data?.colors && data.colors.length > 0) {
            const firstColor = data.colors[0];
            setColor(firstColor);
            
            const sizesForFirstColor = getSizesForColor(data, firstColor);
            if (sizesForFirstColor.length > 0) {
              const firstSize = sizesForFirstColor[0];
              setSize(firstSize);
              
              const variant = findVariant(data, firstColor, firstSize);
              setSelectedVariant(variant);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) { // ✅ Change from productName to productId
      fetchProduct();
    }
  }, [productId]);

  // Helper: Get sizes for a color
  const getSizesForColor = (productData, colorName) => {
    if (!productData?.variants) return [];
    
    const uniqueSizes = [];
    productData.variants.forEach(v => {
      if (v.color === colorName && !uniqueSizes.includes(v.size)) {
        uniqueSizes.push(v.size);
      }
    });
    
    return uniqueSizes;
  };

  // Helper: Find variant
  const findVariant = (productData, colorName, sizeName) => {
    if (!productData?.variants) return null;
    return productData.variants.find(v => 
      v.color === colorName && v.size === sizeName
    );
  };

  // ============ FIX: Get images by color from allImages ============
  const getImagesByColor = (colorName) => {
    console.log("gjhbjhb")
    if (!product || !colorName) return [];
    
    // Option 1: Use imagesByColor if available (from API)
    if (product.allImages && product.imagesByColor[colorName]) {
      return product.imagesByColor[colorName];
    }
    
    // Option 2: Create from allImages
    if (product.allImages) {
      const filteredImages = product.allImages.filter(img => 
        img.color === colorName
      );
      
      console.log(filteredImages,"filteredImages")
      // If no images found for this color, return first image
      if (filteredImages.length === 0 && product.allImages.length > 0) {
        return [product.allImages[0]];
      }
      
      return filteredImages;
    }
    
    // Option 3: Fallback to single image
    if (product.image) {
      return [product.image];
    }
    
    return [];
  };

  // Handle color change
  const handleColorChange = (newColor) => {
    setColor(newColor);
    setSelectedImageIndex(0);
    
    // Get available sizes for new color
    const availableSizes = getSizesForColor(product, newColor);
    if (availableSizes.length > 0) {
      const firstSize = availableSizes[0];
      setSize(firstSize);
      
      // Find variant
      const variant = findVariant(product, newColor, firstSize);
      setSelectedVariant(variant);
    } else {
      setSize("");
      setSelectedVariant(null);
    }
  };

  // Handle size change
  const handleSizeChange = (newSize) => {
    setSize(newSize);
    const variant = findVariant(product, color, newSize);
    setSelectedVariant(variant);
  };

  // Current images based on selected color
  const currentImages = getImagesByColor(color);
  
  // Get selected image
  const selectedImage = currentImages[selectedImageIndex] || 
                       currentImages[0] || 
                       product?.image || 
                       null;
  
  // Stock from selected variant
  const stock = selectedVariant?.stock || product?.totalStock || 0;
  
  // Calculate display price
  const isOfferActive = product?.isOfferActive || false;
  const basePrice = selectedVariant?.price || product?.price || 0;
  const displayPrice = isOfferActive && product?.discount > 0
    ? basePrice * (100 - product.discount) / 100
    : basePrice;
  
  // Colors and sizes
  const colors = product?.colors || [];
  const sizes = getSizesForColor(product, color);

  return {
    product,
    loading,
    quantity,
    setQuantity,
    selectedImage: selectedImage,
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