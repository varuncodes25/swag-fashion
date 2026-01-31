// QuantitySelector.jsx
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
    <div className="flex items-center space-x-4">
      <div className="
        flex
        items-center
        border
        border-gray-200
        dark:border-gray-700
        rounded-xl
        overflow-hidden
        bg-white
        dark:bg-gray-800
        shadow-sm
        hover:shadow-md
        transition-shadow
        duration-200
      ">
        {/* Decrement Button */}
        <button
          onClick={handleDecrement}
          disabled={value <= 1}
          className={`
            px-4
            py-3
            flex
            items-center
            justify-center
            transition-colors
            ${value <= 1
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
            }
          `}
          aria-label="Decrease quantity"
        >
          <Minus className="w-4 h-4" />
        </button>
        
        {/* Quantity Display */}
        <div className="
          px-6
          py-3
          border-l
          border-r
          border-gray-200
          dark:border-gray-700
          bg-gradient-to-b
          from-gray-50
          to-gray-100
          dark:from-gray-900/50
          dark:to-gray-800/50
        ">
          <input
            type="number"
            value={value}
            onChange={handleInputChange}
            min="1"
            max={max}
            className="
              w-12
              text-center
              text-lg
              font-semibold
              bg-transparent
              text-gray-900
              dark:text-white
              focus:outline-none
              focus:ring-0
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
            px-4
            py-3
            flex
            items-center
            justify-center
            transition-colors
            ${value >= max
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
            }
          `}
          aria-label="Increase quantity"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      {/* Max quantity info */}
      {max > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Max: <span className="font-medium text-gray-700 dark:text-gray-300">{max}</span> per order
        </div>
      )}
    </div>
  );
};

export default QuantitySelector;