import { Check } from "lucide-react";

const ColorSelector = ({ 
  colors, 
  imagesByColor, // New prop: Object containing images for each color
  value, 
  imagebycolor,
  onChange 
}) => {
  if (!colors?.length) return null;

  // Color name to hex mapping (fallback if no image)
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

  // Get first image for a color
  const getFirstImageForColor = (colorName) => {
    if (!imagesByColor || !imagesByColor[colorName]) return null;
    
    const colorImages = imagesByColor[colorName];
    if (Array.isArray(colorImages) && colorImages.length > 0) {
      // Find main image first, otherwise first image
      const mainImage = colorImages.find(img => img.isMain);
      return mainImage || colorImages[0];
    }
    return null;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4">
        {colors.map((color) => {
          const isSelected = value === color;
          const firstImage = getFirstImageForColor(color);
          const hexColor = getColorHex(color);

          return (
            <div
              key={color}
              className="relative group"
            >
              {/* COLOR BUTTON WITH IMAGE OR COLOR */}
              <button
                onClick={() => onChange(color)}
                className={`
                  relative
                  w-14
                  h-14
                  rounded-lg
                  transition-all
                  duration-200
                  flex
                  items-center
                  justify-center
                  overflow-hidden
                  hover:scale-105
                  hover:shadow-md
                  border-2
                  ${isSelected 
                    ? 'border-orange-500 dark:border-orange-400 shadow-lg' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
                aria-label={`Select ${color} color`}
              >
                {/* Show image if available */}
                {firstImage ? (
                  <div className="w-full h-full relative">
                    <img
                      src={firstImage.url || firstImage.preview}
                      alt={color}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Overlay for better text visibility */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-orange-500 bg-opacity-20" />
                    )}
                  </div>
                ) : (
                  // Fallback to solid color
                  <div 
                    className="w-full h-full rounded-lg"
                    style={{ backgroundColor: hexColor }}
                  />
                )}
                
                {/* Checkmark for selected */}
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                    <Check className="w-6 h-6 text-white drop-shadow-lg" />
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
              
              {/* Stock indicator (if available) */}
              {/* {stockByColor && stockByColor[color] > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center z-10 border border-white text-[8px] text-white font-bold">
                  {stockByColor[color] > 9 ? '9+' : stockByColor[color]}
                </div>
              )} */}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ColorSelector;