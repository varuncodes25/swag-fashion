// ProductVariants.jsx
import { useState } from "react";
import ColorSelector from "@/components/Product/ColorSelector";
import SizeSelector from "@/components/Product/SizeSelector";
import QuantitySelector from "@/components/Product/QuantitySelector";
import SizeChartModal from "@/components/Product/SizeChartModal"; // ✅ Import modal
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
  onQuantityChange,
  variant,
  clothingType,
  variantsForSizeChart = [],
  sizesOrder = [],
}) => {
  const [showSizeChart, setShowSizeChart] = useState(false);

  const sizeDetailsMeaningful = (sd) => {
    if (!sd || typeof sd !== 'object') return false;
    return Object.keys(sd).some(
      (k) => k !== '_id' && sd[k] !== undefined && sd[k] !== null && sd[k] !== ''
    );
  };

  const hasSizeChart = (variantsForSizeChart.length > 0 ? variantsForSizeChart : [variant]).some((v) =>
    sizeDetailsMeaningful(v?.sizeDetails)
  );

  return (
    <div className="space-y-8">
      {/* Color Selection */}
      {colors.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Select Color
              </h3>
              {selectedColor && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selected: <span className="font-medium text-foreground capitalize">
                    {selectedColor}
                  </span>
                </p>
              )}
            </div>
            <div className="text-xs px-3 py-1.5 rounded-full bg-muted text-gray-700 dark:text-gray-300">
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

      {/* Size Selection - WITH SIZE CHART LINK */}
      {sizes.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Select Size
              </h3>
              {selectedSize && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selected: <span className="font-medium text-foreground">
                    {selectedSize}
                  </span>
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* 🔥 SIZE CHART BUTTON - MEESHO STYLE */}
              {hasSizeChart && (
                <button 
                  onClick={() => setShowSizeChart(true)}
                  className="flex items-center gap-1.5 text-sm text-pink-500 hover:text-primary font-medium transition-colors"
                >
                  <Ruler className="w-4 h-4" />
                  Size Chart
                </button>
              )}
              
              {/* Original Size Guide (if any) */}
              {sizeGuide && !hasSizeChart && (
                <button 
                  onClick={() => window.open(sizeGuide, '_blank')}
                  className="flex items-center gap-1.5 text-sm text-primary dark:text-primary hover:text-primary dark:hover:text-blue-300 hover:underline transition-colors"
                >
                  <Ruler className="w-4 h-4" />
                  Size Guide
                </button>
              )}
            </div>
          </div>
          
          <SizeSelector
            sizes={sizes}
            value={selectedSize}
            onChange={onSizeChange}
          />
          
          {/* Size Help */}
          {!selectedSize && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 dark:bg-blue-900/20 border border-blue-100 dark:border-primary/30/30">
              <Info className="w-4 h-4 text-primary dark:text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-primary dark:text-primary">
                Please select a size to check availability and pricing
              </p>
            </div>
          )}

          {/* 🔥 SIZE CHART PREVIEW - Small hint that size chart exists */}
          {hasSizeChart && selectedSize && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-1 h-1 rounded-full bg-green-500"></span>
              <span>Size measurements available. Click "Size Chart" to view.</span>
            </div>
          )}
        </div>
      )}

      {/* Quantity Selection */}
      <div className="flex flex-row items-center gap-4 gap-6">
        <div className="w-full md:w-auto">
          <QuantitySelector
            value={quantity}
            onChange={onQuantityChange}
            max={stock}
          />
        </div>
        
        <div className="text-sm w-full md:w-auto">
          {stock > 0 ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  stock > 10 ? 'bg-green-500' : 'bg-highlight'
                }`} />
                <span className="text-muted-foreground">
                  {stock > 10 ? 'Good availability' : 'Limited stock'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Only {stock} units remaining
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-destructive font-medium">
                Currently unavailable
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 🔥 SIZE CHART MODAL */}
      <SizeChartModal
        isOpen={showSizeChart}
        onClose={() => setShowSizeChart(false)}
        variant={variant}
        productName={variant?.color}
        clothingType={clothingType}
        variantsForSizeChart={variantsForSizeChart}
        sizesOrder={sizesOrder}
      />
    </div>
  );
};

export default ProductVariants;