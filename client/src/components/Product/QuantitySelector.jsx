import { Minus, Plus } from "lucide-react";

const QuantitySelector = ({ value, onChange, max = 10 }) => {
  const handleDecrement = () => {
    if (value > 1) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e) => {
    const newValue = parseInt(e.target.value);
    if (!isNaN(newValue) && newValue >= 1 && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className="w-full">
      {/* Mobile: Single Row Layout */}
      <div className="">
      
        
        <div className="flex items-center gap-2">
          {/* Mobile Buttons */}
          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
            {/* Decrement Button */}
            <button
              onClick={handleDecrement}
              disabled={value <= 1}
              className={`
                p-2 md:p-3
                flex items-center justify-center
                transition-colors
                ${value <= 1
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              `}
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3 md:w-4 md:h-4" />
            </button>
            
            {/* Quantity Display */}
            <div className="
              px-4 py-2 md:px-6 md:py-3
              border-l border-r border-gray-200 dark:border-gray-700
              min-w-[50px] md:min-w-[60px] text-center
            ">
              <input
                type="number"
                value={value}
                onChange={handleInputChange}
                min="1"
                max={max}
                className="
                  w-full
                  text-center
                  text-base md:text-lg
                  font-semibold
                  bg-transparent
                  text-gray-900 dark:text-white
                  focus:outline-none focus:ring-0
                  [appearance:textfield]
                  [&::-webkit-outer-spin-button]:appearance-none
                  [&::-webkit-inner-spin-button]:appearance-none
                "
                aria-label="Quantity"
              />
            </div>
            
            {/* Increment Button */}
            <button
              onClick={handleIncrement}
              disabled={value >= max}
              className={`
                p-2 md:p-3
                flex items-center justify-center
                transition-colors
                ${value >= max
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              `}
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>
          
          {/* Max Info - Mobile Hidden */}
          <div className="hidden md:block text-sm text-gray-500 dark:text-gray-400">
            Max: <span className="font-medium text-gray-700 dark:text-gray-300">{max}</span>
          </div>
        </div>
      </div>
      
      {/* Max Info - Mobile Only */}
      <div className="md:hidden mt-2 text-xs text-gray-500 dark:text-gray-400">
        Max {max} per order
      </div>
    </div>
  );
};

export default QuantitySelector;