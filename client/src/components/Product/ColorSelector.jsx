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
    <div>
      <div className="flex flex-wrap gap-2.5 lg:gap-4">
        {colors.map((color) => {
          const isSelected = value === color;
          const firstImage = getFirstImageForColor(color);
          const hexColor = getColorHex(color);

          return (
            <div key={color} className="group relative">
              <button
                onClick={() => onChange(color)}
                className={`
                  relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border-2 transition-all duration-200 hover:scale-105 hover:shadow-md lg:h-14 lg:w-14
                  ${isSelected
                    ? "border-warning shadow-md dark:border-orange-400 lg:shadow-lg"
                    : "border-border hover:border-gray-300 dark:hover:border-gray-600"
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ColorSelector;