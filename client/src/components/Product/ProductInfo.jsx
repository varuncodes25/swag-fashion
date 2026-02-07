import { Star, Truck, CheckCircle2 } from "lucide-react";

const ProductInfo = ({ name, rating, price, displayPrice, discount, isOfferActive }) => {
  return (
    <div className="space-y-3">
      {/* Product Name */}
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
        {name}
      </h1>
      
      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-4 h-4 ${
                i < rating 
                  ? 'fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500' 
                  : 'text-gray-300 dark:text-gray-600'
              }`} 
            />
          ))}
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {rating?.toFixed(1) || "0.0"}
        </span>
      </div>
      
      {/* Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          ₹{displayPrice?.toFixed(0) || price?.toFixed(0)}
        </span>
        
        {isOfferActive && discount > 0 && price && displayPrice && (
          <>
            <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
              ₹{price?.toFixed(0)}
            </span>
            <span className="px-2 py-1 bg-red-500 dark:bg-red-600 text-white text-xs rounded">
              {discount}% OFF
            </span>
          </>
        )}
      </div>
      
      
    </div>
  );
};

export default ProductInfo;