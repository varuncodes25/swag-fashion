// ProductVariants.jsx
import { useState } from "react";
import ColorSelector from "@/components/Product/ColorSelector";
import SizeSelector from "@/components/Product/SizeSelector";
import QuantitySelector from "@/components/Product/QuantitySelector";
import SizeChartModal from "@/components/Product/SizeChartModal";
import { Ruler, Info } from "lucide-react";
import {
  productHasSizeChart,
} from "@/constants/sizeChartTemplates";

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
  sizeChartTemplate = null,
  sizeChart = null,
}) => {
  const [showSizeChart, setShowSizeChart] = useState(false);

  const hasSizeChart = productHasSizeChart({
    sizeChartTemplate,
    sizeChart,
    variants: variantsForSizeChart.length > 0 ? variantsForSizeChart : [variant],
  });

  return (
    <div className="space-y-4 lg:space-y-8">
      {colors.length > 0 && (
        <div className="space-y-2 lg:space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground lg:text-lg">
                Select Color
                {selectedColor && (
                  <span className="ml-1.5 font-normal text-muted-foreground lg:ml-0 lg:block lg:text-sm">
                    · <span className="capitalize text-foreground">{selectedColor}</span>
                  </span>
                )}
              </h3>
            </div>
            <div className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-gray-700 dark:text-gray-300 lg:px-3 lg:py-1.5 lg:text-xs">
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

      {sizes.length > 0 && (
        <div className="space-y-2 lg:space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground lg:text-lg">
                Select Size
                {selectedSize && (
                  <span className="ml-1.5 font-normal text-muted-foreground lg:ml-0 lg:block lg:text-sm">
                    · <span className="text-foreground">{selectedSize}</span>
                  </span>
                )}
              </h3>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {hasSizeChart && (
                <button
                  onClick={() => setShowSizeChart(true)}
                  className="flex items-center gap-1 text-xs font-medium text-pink-500 transition-colors hover:text-primary lg:gap-1.5 lg:text-sm"
                >
                  <Ruler className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                  Size Chart
                </button>
              )}

              {sizeGuide && !hasSizeChart && (
                <button
                  onClick={() => window.open(sizeGuide, "_blank")}
                  className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:underline lg:gap-1.5 lg:text-sm"
                >
                  <Ruler className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
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
            <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-primary/10 p-2 dark:border-primary/30 dark:bg-blue-900/20 lg:p-3">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary lg:h-4 lg:w-4" />
              <p className="text-xs text-primary lg:text-sm">
                Please select a size to check availability and pricing
              </p>
            </div>
          )}

          {hasSizeChart && selectedSize && (
            <p className="hidden text-xs text-muted-foreground lg:block">
              Size measurements available. Click &quot;Size Chart&quot; to view.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-row items-center gap-3 lg:gap-6">
        <div className="w-full md:w-auto">
          <QuantitySelector
            value={quantity}
            onChange={onQuantityChange}
            max={stock}
          />
        </div>

        <div className="w-full text-xs md:w-auto lg:text-sm">
          {stock > 0 ? (
            <div>
              <div className="flex items-center gap-1.5">
                <div className={`h-1.5 w-1.5 rounded-full lg:h-2 lg:w-2 ${
                  stock > 10 ? "bg-green-500" : "bg-highlight"
                }`} />
                <span className="text-muted-foreground">
                  {stock > 10 ? "In stock" : "Limited stock"}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground lg:text-xs">
                {stock} left
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
        sizeChartTemplate={sizeChartTemplate}
        sizeChart={sizeChart}
      />
    </div>
  );
};

export default ProductVariants;