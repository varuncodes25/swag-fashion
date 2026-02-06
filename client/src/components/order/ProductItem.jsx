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
      'white': 'bg-white border border-gray-300',
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
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-sm transition-shadow duration-200">
      <div className="p-4">
        <div className="flex gap-4">
          {/* Product Image */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              <img
                src={productImage}
                alt={productName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Discount Badge */}
            {discountPercent > 0 && (
              <div className="absolute -top-2 -left-2">
                <div className="flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                  <Tag className="w-3 h-3" />
                  <span>{discountPercent}%</span>
                </div>
              </div>
            )}

            {/* Quantity Badge */}
            <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center border-2 border-white dark:border-gray-800">
              {quantity}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            {/* Product Name */}
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-2 mb-2">
              {productName}
            </h3>

            {/* Color and Size */}
            <div className="flex items-center gap-3 mb-3">
              {color !== "N/A" && (
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${getColorClass(color)}`} />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {color}
                  </span>
                </div>
              )}

              {size !== "N/A" && (
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Size:</span>
                  <span>{size}</span>
                </div>
              )}
            </div>

            {/* Price Section */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ₹{itemTotal}
                  </span>
                  
                  {mrp > sellingPrice && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
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
                className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
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
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 animate-slideDown">
          <div className="pt-4">
            {/* Price Breakdown */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Unit Price</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  ₹{sellingPrice.toFixed(2)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Quantity</p>
                <p className="font-medium text-gray-900 dark:text-white">{quantity}</p>
              </div>

              {mrp > sellingPrice && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">MRP</p>
                  <p className="font-medium text-gray-900 dark:text-white line-through">
                    ₹{mrp.toFixed(2)}
                  </p>
                </div>
              )}

              {mrp > sellingPrice && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">You Saved</p>
                  <p className="font-medium text-green-600 dark:text-green-400">
                    ₹{savedAmount}
                  </p>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Item Total
                </p>
                <p className="font-bold text-lg text-gray-900 dark:text-white">
                  ₹{itemTotal}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button className="flex-1 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                View Details
              </button>
              <button className="flex-1 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
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