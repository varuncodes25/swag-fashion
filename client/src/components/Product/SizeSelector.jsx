// SizeSelector.jsx
import { Check, Zap, AlertCircle } from "lucide-react";

const SizeSelector = ({ sizes, value, onChange, stockData }) => {
  if (!sizes?.length) return null;

  // Size sorting order
  const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL'];
  
  // Sort sizes
  const sortedSizes = [...sizes].sort((a, b) => {
    const aUpper = a.toUpperCase();
    const bUpper = b.toUpperCase();
    
    // Check predefined sizes first
    const indexA = sizeOrder.indexOf(aUpper);
    const indexB = sizeOrder.indexOf(bUpper);
    
    if (indexA !== -1 || indexB !== -1) {
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    }
    
    // Check if numeric sizes
    const numA = parseInt(a);
    const numB = parseInt(b);
    
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    
    // Default string comparison
    return a.localeCompare(b);
  });

  // Get size availability
  const getSizeStatus = (size) => {
    if (stockData?.[size] !== undefined) {
      const stock = stockData[size];
      if (stock === 0) return 'out-of-stock';
      if (stock <= 5) return 'low-stock';
      if (stock > 20) return 'high-stock';
    }
    
    // Default logic
    const popularSizes = ['M', 'L', '38', '40', '42'];
    const lowStockSizes = ['XXXL', '5XL', '44', '46'];
    
    if (popularSizes.includes(size.toString())) return 'popular';
    if (lowStockSizes.includes(size.toString())) return 'low-stock';
    return 'available';
  };

  return (
    <div className="space-y-3">
      {/* Size Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
        {sortedSizes.map((size) => {
          const isSelected = value === size;
          const status = getSizeStatus(size);
          const isOutOfStock = status === 'out-of-stock';
          
          return (
            <button
              key={size}
              onClick={() => !isOutOfStock && onChange(size)}
              disabled={isOutOfStock}
              className={`
                relative
                h-10
                rounded-md
                border
                transition-all
                duration-150
                flex
                items-center
                justify-center
                text-sm
                font-medium
                ${isSelected
                  ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white border-orange-500 shadow-sm'
                  : isOutOfStock
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                    : status === 'popular'
                      ? 'bg-green-50 dark:bg-green-900/20 text-gray-800 dark:text-gray-200 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700 hover:shadow-sm'
                      : status === 'low-stock'
                        ? 'bg-amber-50 dark:bg-amber-900/20 text-gray-800 dark:text-gray-200 border-amber-200 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-sm'
                        : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
                }
                hover:scale-105
                active:scale-95
                disabled:hover:scale-100
                disabled:hover:shadow-none
                group
              `}
              aria-label={`Select size ${size}${isOutOfStock ? ' (Out of stock)' : ''}`}
            >
              {/* Size label */}
              <span className={`relative z-10 ${isSelected ? 'font-semibold' : ''}`}>
                {size}
              </span>
              
              {/* Selected indicator */}
              {isSelected && (
                <Check className="absolute top-1 right-1 w-3 h-3 text-white" />
              )}
              
              {/* Status indicators */}
              {!isSelected && !isOutOfStock && status === 'popular' && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center border border-white dark:border-gray-900">
                  <Zap className="w-2 h-2 text-white" />
                </div>
              )}
              
              {!isSelected && !isOutOfStock && status === 'low-stock' && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center border border-white dark:border-gray-900">
                  <span className="text-[8px] font-bold text-white">!</span>
                </div>
              )}
              
              {/* Out of stock indicator */}
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 bg-opacity-80 rounded-md">
                  <span className="text-gray-400 dark:text-gray-600 text-xs">×</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Compact Legend */}
      <div className="flex items-center  gap-3 text-xs text-gray-500 dark:text-gray-400 pt-1">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center">
            <Zap className="w-2 h-2 text-white" />
          </div>
          <span>Popular</span>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-amber-500 flex items-center justify-center">
            <span className="text-[8px] font-bold text-white">!</span>
          </div>
          <span>Low stock</span>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded border border-orange-500 bg-orange-500 flex items-center justify-center">
            <Check className="w-2 h-2 text-white" />
          </div>
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
};

export default SizeSelector;