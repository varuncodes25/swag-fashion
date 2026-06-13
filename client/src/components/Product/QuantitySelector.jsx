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
          <div className="flex items-center rounded-lg border border-border bg-card">
            <button
              onClick={handleDecrement}
              disabled={value <= 1}
              className={`flex items-center justify-center p-1.5 transition-colors lg:p-3 ${
                value <= 1
                  ? "cursor-not-allowed text-gray-300 dark:text-gray-600"
                  : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3 lg:h-4 lg:w-4" />
            </button>

            <div className="min-w-[40px] border-l border-r border-border px-3 py-1.5 text-center lg:min-w-[60px] lg:px-6 lg:py-3">
              <input
                type="number"
                value={value}
                onChange={handleInputChange}
                min="1"
                max={max}
                className="w-full [appearance:textfield] bg-transparent text-center text-sm font-semibold text-foreground focus:outline-none focus:ring-0 lg:text-lg [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                aria-label="Quantity"
              />
            </div>

            <button
              onClick={handleIncrement}
              disabled={value >= max}
              className={`flex items-center justify-center p-1.5 transition-colors lg:p-3 ${
                value >= max
                  ? "cursor-not-allowed text-gray-300 dark:text-gray-600"
                  : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3 lg:h-4 lg:w-4" />
            </button>
          </div>
          
          {/* Max Info - Mobile Hidden */}
          <div className="hidden md:block text-sm text-muted-foreground">
            Max: <span className="font-medium text-gray-700 dark:text-gray-300">{max}</span>
          </div>
        </div>
      </div>
      
      {/* Max Info - Mobile Only */}
      <div className="mt-1 text-[10px] text-muted-foreground lg:hidden">
        Max {max} per order
      </div>
    </div>
  );
};

export default QuantitySelector;