// reviewUtils.js

export function getAuthUserId(user) {
  if (!user) return null;
  return String(user._id || user.id || "");
}

export function getReviewUserId(review) {
  const reviewUser = review?.user || review?.userId;
  if (!reviewUser) return null;
  if (typeof reviewUser === "string") return reviewUser;
  return String(reviewUser._id || reviewUser.id || "");
}

export function isSameUser(user, review) {
  const authId = getAuthUserId(user);
  const reviewUserId = getReviewUserId(review);
  return Boolean(authId && reviewUserId && authId === reviewUserId);
}

/**
 * First letter of first name + first letter of last name (e.g. "Rahul Kumar" → "RK")
 */
export const getUserInitials = (name) => {
  if (!name || typeof name !== "string") return "?";

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase();
};

/**
 * Format date string to readable format
 * @param {string|Date} dateString - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return "Date not available";
  
  try {
    const date = new Date(dateString);
    
    // Validate date
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    };
    
    return date.toLocaleDateString('en-US', defaultOptions);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Date format error";
  }
};

/**
 * Calculate average rating from reviews array
 * @param {Array} reviews - Array of review objects with rating property
 * @param {number} precision - Decimal precision (default: 1)
 * @returns {string} Formatted average rating
 */
export const calculateAverageRating = (reviews, precision = 1) => {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return "0.0";
  }
  
  try {
    const validReviews = reviews.filter(review => 
      review && 
      typeof review.rating === 'number' && 
      !isNaN(review.rating) && 
      review.rating >= 1 && 
      review.rating <= 5
    );
    
    if (validReviews.length === 0) {
      return "0.0";
    }
    
    const total = validReviews.reduce((sum, review) => sum + review.rating, 0);
    const average = total / validReviews.length;
    
    return average.toFixed(precision);
  } catch (error) {
    console.error("Error calculating average rating:", error);
    return "0.0";
  }
};

/**
 * Get rating distribution (5-star, 4-star, etc.)
 * @param {Array} reviews - Array of review objects
 * @returns {Object} Rating distribution object
 */
export const getRatingDistribution = (reviews) => {
  const distribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
    total: 0
  };
  
  if (!Array.isArray(reviews)) return distribution;
  
  reviews.forEach(review => {
    if (review && review.rating >= 1 && review.rating <= 5) {
      distribution[review.rating]++;
      distribution.total++;
    }
  });
  
  return distribution;
};

/**
 * Calculate rating percentage for a specific star
 * @param {number} starCount - Number of reviews for a specific star
 * @param {number} totalReviews - Total number of reviews
 * @returns {number} Percentage (0-100)
 */
export const calculateRatingPercentage = (starCount, totalReviews) => {
  if (!totalReviews || totalReviews === 0) return 0;
  return Math.round((starCount / totalReviews) * 100);
};

/**
 * Generate star rating display component (basic version)
 * @param {number} rating - Rating value (1-5)
 * @param {string} size - Size of stars ('sm', 'md', 'lg')
 * @returns {Array} Array of star elements
 */
export const generateStars = (rating, size = 'md') => {
  const stars = [];
  const sizeMap = {
    sm: 16,
    md: 20,
    lg: 24
  };
  const starSize = sizeMap[size] || 20;
  
  for (let i = 1; i <= 5; i++) {
    const isFilled = i <= rating;
    const starClass = isFilled 
      ? "fill-amber-400 text-amber-400" 
      : "text-gray-300 dark:text-gray-600";
    
    stars.push({
      key: i,
      isFilled,
      size: starSize,
      className: starClass
    });
  }
  
  return stars;
};

/**
 * Format relative time (e.g., "2 days ago", "1 month ago")
 * @param {string|Date} dateString - Date to compare
 * @returns {string} Relative time string
 */
export const getRelativeTime = (dateString) => {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  } catch (error) {
    return formatDate(dateString);
  }
};

// Export all utilities
export default {
  getAuthUserId,
  getReviewUserId,
  isSameUser,
  getUserInitials,
  formatDate,
  calculateAverageRating,
  getRatingDistribution,
  calculateRatingPercentage,
  generateStars,
  getRelativeTime,
};