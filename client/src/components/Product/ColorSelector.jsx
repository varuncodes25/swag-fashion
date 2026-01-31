// ColorSelector.jsx
import { Check } from "lucide-react";

const ColorSelector = ({ colors, value, onChange }) => {
  if (!colors?.length) return null;

  // Color name to hex mapping
  const COLOR_MAP = {
    'Red': '#ef4444',
    'Blue': '#3b82f6',
    'Green': '#10b981',
    'Black': '#000000',
    'White': '#ffffff',
    'Yellow': '#fbbf24',
    'Purple': '#8b5cf6',
    'Gray': '#6b7280',
    'Pink': '#ec4899',
    'Orange': '#f97316',
    'Brown': '#92400e',
    'Navy': '#1e3a8a',
    'Teal': '#0d9488',
    'Maroon': '#991b1b',
    'Cream': '#fef3c7',
    'Charcoal': '#374151'
  };

  const getColorHex = (colorName) => {
    if (colorName.startsWith('#')) return colorName;
    return COLOR_MAP[colorName] || colorName;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => {
          const isSelected = value === color;
          const hexColor = getColorHex(color);

          return (
            <div
              key={color}
              className="relative group"
            >
              {/* MAIN COLOR BUTTON */}
              <button
                onClick={() => onChange(color)}
                className={`
                  relative
                  w-12
                  h-12
                  rounded-full
                  transition-all
                  duration-200
                  flex
                  items-center
                  justify-center
                  overflow-hidden
                  hover:scale-105
                  hover:shadow-md
                  ${isSelected 
                    ? 'ring-4 ring-offset-2 ring-orange-500 dark:ring-orange-400 shadow-lg' 
                    : 'ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-gray-300 dark:hover:ring-gray-600'
                  }
                `}
                style={{ backgroundColor: hexColor }}
                aria-label={`Select ${color} color`}
              >
                {/* Inner circle with same background color */}
                <div 
                  className="w-10 h-10 rounded-full"
                  style={{ backgroundColor: hexColor }}
                />
                
                {/* Checkmark for selected */}
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="w-5 h-5 text-white drop-shadow-lg" />
                  </div>
                )}
              </button>
              
              {/* Color Label */}
              <div className="mt-2 text-center">
                <span className={`
                  text-xs font-medium capitalize
                  ${isSelected 
                    ? 'text-orange-600 dark:text-orange-400 font-semibold' 
                    : 'text-gray-600 dark:text-gray-400'
                  }
                `}>
                  {color}
                </span>
              </div>
              
              {/* Selection indicator (corner dot) */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center z-10 border-2 border-white dark:border-gray-800 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ColorSelector;