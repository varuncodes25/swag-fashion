// src/components/custom/OrderData/ProductItem.jsx
import React, { useState } from "react";
import { ChevronDown, ChevronUp, Tag } from "lucide-react";

const ProductItem = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Extract data directly from item
  const productName = item.name || "Product";
  const productImage = item.image || "/placeholder.png";
  const quantity = item.quantity || 1;
  const color = item.color || "N/A";
  const size = item.size || "N/A";
  
  // Extract pricing data
  const mrp = item.pricing?.mrp || item.price || 0;
  const sellingPrice = item.pricing?.sellingPrice || item.finalPrice || 0;
  const itemTotal = (sellingPrice * quantity).toFixed(2);
  const originalTotal = (mrp * quantity).toFixed(2);
  const savedAmount = ((mrp - sellingPrice) * quantity).toFixed(2);
  const discountPercent = mrp > 0 
    ? Math.round(((mrp - sellingPrice) / mrp) * 100) 
    : 0;

  // Get color display
  const getColorClass = (color) => {
    const colorMap = {
      'red': 'bg-red-500',
      'blue': 'bg-blue-500',
      'green': 'bg-green-500',
      'black': 'bg-black',
      'white': 'bg-white border border-border',
      'navy': 'bg-blue-800',
      'gray': 'bg-gray-400',
      'pink': 'bg-pink-400',
      'purple': 'bg-purple-500',
      'yellow': 'bg-yellow-400',
      'orange': 'bg-orange-500',
      'brown': 'bg-yellow-800',
    };
    return colorMap[color.toLowerCase()] || 'bg-gray-300';
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-sm transition-shadow duration-200">
      <div className="p-4">
        <div className="flex gap-4">
          {/* Product Image */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-muted">
              <img
                src={productImage}
                alt={productName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/96x96?text=No+Image";
                }}
              />
            </div>

            {/* Discount Badge */}
            {discountPercent > 0 && (
              <div className="absolute -top-2 -left-2">
                <div className="flex items-center gap-1 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                  <Tag className="w-3 h-3" />
                  <span>{discountPercent}%</span>
                </div>
              </div>
            )}

            {/* Quantity Badge */}
            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center border-2 border-background">
              {quantity}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            {/* Product Name */}
            <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-2 mb-2">
              {productName}
            </h3>

            {/* Color and Size */}
            <div className="flex items-center gap-3 mb-3">
              {color !== "N/A" && (
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${getColorClass(color)}`} />
                  <span className="text-xs text-muted-foreground">
                    {color}
                  </span>
                </div>
              )}

              {size !== "N/A" && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">Size:</span>
                  <span>{size}</span>
                </div>
              )}
            </div>

            {/* Price Section */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-foreground">
                    ₹{itemTotal}
                  </span>
                  
                  {mrp > sellingPrice && (
                    <span className="text-sm text-muted-foreground/70 line-through">
                      ₹{originalTotal}
                    </span>
                  )}
                </div>
                
                {mrp > sellingPrice && (
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                    You saved ₹{savedAmount}
                  </p>
                )}
              </div>

              {/* Expand Button */}
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                {expanded ? "Less" : "More"}
                {expanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-border animate-slideDown">
          <div className="pt-4">
            {/* Price Breakdown */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground/70">Unit Price</p>
                <p className="font-medium text-foreground">
                  ₹{sellingPrice.toFixed(2)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground/70">Quantity</p>
                <p className="font-medium text-foreground">{quantity}</p>
              </div>

              {mrp > sellingPrice && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground/70">MRP</p>
                  <p className="font-medium text-foreground line-through">
                    ₹{mrp.toFixed(2)}
                  </p>
                </div>
              )}

              {mrp > sellingPrice && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground/70">You Saved</p>
                  <p className="font-medium text-green-600 dark:text-green-400">
                    ₹{savedAmount}
                  </p>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Item Total
                </p>
                <p className="font-bold text-lg text-foreground">
                  ₹{itemTotal}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button className="flex-1 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                View Details
              </button>
              <button className="flex-1 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Buy Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductItem;