// ProductVariants.jsx
import ColorSelector from "@/components/Product/ColorSelector";
import SizeSelector from "@/components/Product/SizeSelector";
import QuantitySelector from "@/components/Product/QuantitySelector";
import { Ruler, Info } from "lucide-react";

const ProductVariants = ({
  colors = [],
  imagebycolor,
  selectedColor,
  onColorChange,
  sizes = [],
  selectedSize,
  onSizeChange,
  sizeGuide,
  stock,
  quantity,
  onQuantityChange
}) => {
  return (
    <div className="space-y-8">
      {/* Color Selection */}
      {colors.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Select Color
              </h3>
              {selectedColor && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Selected: <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {selectedColor}
                  </span>
                </p>
              )}
            </div>
            <div className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              {colors.length} options
            </div>
          </div>
          
          <ColorSelector
            colors={colors}
            value={selectedColor}
            imagesByColor={imagebycolor}
            onChange={onColorChange}
          />
        </div>
      )}

      {/* Size Selection */}
      {sizes.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Select Size
              </h3>
              {selectedSize && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Selected: <span className="font-medium text-gray-900 dark:text-white">
                    {selectedSize}
                  </span>
                </p>
              )}
            </div>
            
            {sizeGuide && (
              <button 
                onClick={() => window.open(sizeGuide, '_blank')}
                className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
              >
                <Ruler className="w-4 h-4" />
                Size Guide
              </button>
            )}
          </div>
          
          <SizeSelector
            sizes={sizes}
            value={selectedSize}
            onChange={onSizeChange}
          />
          
          {/* Size Help */}
          {!selectedSize && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Please select a size to check availability and pricing
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quantity Selection */}
      <div className="flex flex-row items-center gap-4 gap-6">
  {/* Quantity Selector - Takes full width on mobile */}
  <div className="w-full md:w-auto">
    <QuantitySelector
      value={quantity}
      onChange={onQuantityChange}
      max={stock}
    />
  </div>
  
  {/* Stock Details - Below on mobile, beside on desktop */}
  <div className="text-sm w-full md:w-auto">
    {stock > 0 ? (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            stock > 10 ? 'bg-green-500' : 'bg-amber-500'
          }`} />
          <span className="text-gray-600 dark:text-gray-400">
            {stock > 10 ? 'Good availability' : 'Limited stock'}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Only {stock} units remaining
        </p>
      </div>
    ) : (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500" />
        <span className="text-red-600 dark:text-red-400 font-medium">
          Currently unavailable
        </span>
      </div>
    )}
  </div>
</div>
    </div>
  );
};

export default ProductVariants;