import { Check } from "lucide-react";

const ColorSelector = ({ 
  colors, 
  imagesByColor,
  value, 
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

  const getFirstImageForColor = (colorName) => {
    if (!imagesByColor || !imagesByColor[colorName]) return null;
    
    const colorImages = imagesByColor[colorName];
    if (Array.isArray(colorImages) && colorImages.length > 0) {
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
            <div key={color} className="relative group">
              {/* COLOR BUTTON */}
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
                    ? 'border-warning dark:border-orange-400 shadow-lg' 
                    : 'border-border hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
                aria-label={`Select ${color} color`}
              >
                {/* Show image if available */}
                {firstImage ? (
                  <img
                    src={firstImage.url || firstImage.preview}
                    alt={color}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div 
                    className="w-full h-full"
                    style={{ backgroundColor: hexColor }}
                  />
                )}
                
                {/* ✅ FIXED: Very light overlay + clean checkmark */}
                {isSelected && (
                  <>
                    {/* Very light overlay - only 5% black */}
                    <div className="absolute inset-0 bg-black/5 rounded-lg" />
                    
                    {/* Clean checkmark in center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-warning rounded-full p-1 shadow-md transform transition-transform group-hover:scale-110">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  </>
                )}
              </button>
              
              {/* Color Label */}
              <div className="mt-2 text-center">
                <span className={`
                  text-xs font-medium capitalize
                  ${isSelected 
                    ? 'text-warning dark:text-orange-400 font-semibold' 
                    : 'text-muted-foreground'
                  }
                `}>
                  {color}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ColorSelector;