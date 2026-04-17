// utils/productHelpers.js

// Flipkart जैसा price formatting
export const formatPrice = (amount) => {
  if (!amount && amount !== 0) return '₹--';
  
  // Indian numbering system with commas
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  
  return `₹${formatted}`;
};

// Discounted price के लिए (Flipkart जैसा)
export const formatPriceWithDiscount = (price, discountedPrice) => {
  if (!price || !discountedPrice) return { original: '₹--', discounted: '₹--' };
  
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
  
  const formattedDiscounted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(discountedPrice);
  
  return {
    original: `₹${formattedPrice}`,
    discounted: `₹${formattedDiscounted}`,
    discountPercent: Math.round(((price - discountedPrice) / price) * 100)
  };
};

// Flipkart style - Short format (for large amounts)
export const formatPriceShort = (amount) => {
  if (!amount && amount !== 0) return '₹--';
  
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)} L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)} K`;
  }
  return `₹${amount}`;
};

export const getStockStatus = (stock) => {
  if (stock <= 0) {
    return {
      text: "Out of Stock",
      color: "text-destructive",
      bg: "bg-destructive/10 dark:bg-destructive/20",
      border: "border border-destructive/30",
    };
  }

  if (stock <= 5) {
    return {
      text: `Only ${stock} left`,
      color: "text-highlight dark:text-amber-300",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border border-amber-200 dark:border-amber-800",
    };
  }

  return {
    text: "In Stock",
    color: "text-success",
    bg: "bg-success/10 dark:bg-success/20",
    border: "border border-success/30",
  };
};

export const getImageUrl = ({ image, variants, imageError }) => {
  if (imageError) {
    return "https://images.pexels.com/photos/3801990/pexels-photo-3801990.jpeg";
  }
  if (image?.url) return image.url;
  if (variants?.[0]?.images?.[0]?.url)
    return variants[0].images[0].url;

  return "https://images.pexels.com/photos/3801990/pexels-photo-3801990.jpeg";
};
