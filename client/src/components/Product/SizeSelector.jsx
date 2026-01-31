// SizeSelector.jsx
import { Check } from "lucide-react";

const SizeSelector = ({ sizes, value, onChange }) => {
  if (!sizes?.length) return null;

  // ✅ Size ko ascending order mein sort karo
  const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL'];
  
  const sortedSizes = [...sizes].sort((a, b) => {
    const indexA = sizeOrder.indexOf(a.toUpperCase());
    const indexB = sizeOrder.indexOf(b.toUpperCase());
    
    // Agar size predefined order mein nahi hai
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    
    return indexA - indexB;
  });

  // ✅ Numeric size hai toh numeric sort karo
  const hasNumericSizes = sortedSizes.some(size => !isNaN(parseInt(size)));
  
  if (hasNumericSizes) {
    sortedSizes.sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return 0;
    });
  }

  const getSizeAvailability = (size) => {
    // In real app, this would come from API
    // For demo, let's assume M, L are popular
    const popularSizes = ['M', 'L', '38', '40']; // Common sizes
    const lowStockSizes = ['XXXL', '5XL', '44']; // Less common
    
    if (popularSizes.includes(size.toString())) {
      return 'popular';
    } else if (lowStockSizes.includes(size.toString())) {
      return 'low';
    }
    return 'normal';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-7">
        {sortedSizes.map((size) => {
          const isSelected = value === size;
          const availability = getSizeAvailability(size);
          
          return (
            <button
              key={size}
              onClick={() => onChange(size)}
              className={`
                relative
                aspect-square
                w-full
                rounded-lg
                border-2
                transition-all
                duration-200
                font-medium
                flex
                items-center
                justify-center
                text-sm
                sm:text-base
                ${isSelected
                  ? 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 border-orange-500 dark:border-orange-400 text-orange-700 dark:text-orange-300 shadow-md'
                  : availability === 'popular'
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800/40 text-gray-800 dark:text-gray-200 hover:border-green-300 dark:hover:border-green-700 hover:shadow-sm'
                    : availability === 'low'
                      ? 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800/40 text-gray-800 dark:text-gray-200 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-sm'
                      : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
                }
                hover:scale-105
                group
                overflow-hidden
              `}
              aria-label={`Select size ${size}`}
            >
              {/* Background glow for selected */}
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 dark:from-orange-400/10 dark:to-amber-400/10" />
              )}
              
              {/* Size text */}
              <span className="relative z-10 font-semibold">
                {size}
              </span>
              
              {/* Checkmark for selected */}
              {isSelected && (
                <Check className="absolute top-1 right-1 w-3 h-3 text-orange-600 dark:text-orange-400" />
              )}
              
              {/* Popular/Low badge */}
              {!isSelected && availability === 'popular' && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center border border-white dark:border-gray-800">
                  <span className="text-[8px] text-white font-bold">✓</span>
                </div>
              )}
              
              {!isSelected && availability === 'low' && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center border border-white dark:border-gray-800">
                  <span className="text-[8px] text-white font-bold">!</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Size Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center">
            <span className="text-[8px] text-white">✓</span>
          </div>
          <span>Popular size</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-500 flex items-center justify-center">
            <span className="text-[8px] text-white">!</span>
          </div>
          <span>Limited stock</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2 border-orange-500 flex items-center justify-center">
            <Check className="w-2 h-2 text-orange-500" />
          </div>
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
};

export default SizeSelector;