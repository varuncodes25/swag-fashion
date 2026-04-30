import { Star, Shield, RotateCcw, Truck, Clock } from "lucide-react";

const ProductInfo = ({
  name,
  rating,
  price,
  sellingPrice,
  discount,
  isOfferActive,
  reviewCount,
  freeShipping = false,
  returnPolicy = "7 Days Return Available",
  estimatedDelivery = 7,
  isInStock = true,
  availableStock = 0,
}) => {
  const finalPrice = sellingPrice || (isOfferActive && discount ? price - (price * discount / 100) : price);
  const hasDiscount = isOfferActive && discount > 0 && finalPrice < price;
  const savings = hasDiscount ? price - finalPrice : 0;

  return (
    <div className="space-y-4">
      {/* Product Name */}
      <h1 className="text-xl md:text-2xl font-bold text-foreground">
        {name}
      </h1>

      {/* Rating */}
      {reviewCount > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium">
            {rating?.toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground">
            ({reviewCount} reviews)
          </span>
        </div>
      )}

      {/* Price Section */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-2 flex-wrap">
          {/* Final Price */}
          <span className="text-3xl font-bold text-foreground">
            ₹{finalPrice?.toFixed(0)}
          </span>

          {/* Original Price */}
          {hasDiscount && (
            <span className="text-lg text-muted-foreground line-through">
              ₹{price?.toFixed(0)}
            </span>
          )}

          {/* Discount Badge */}
          {hasDiscount && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-md font-semibold">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Savings */}
        {hasDiscount && savings > 0 && (
          <p className="text-sm text-green-600 font-medium">
            You save: ₹{savings.toFixed(0)} ({discount}% off)
          </p>
        )}

        {/* Tax Info */}
        <p className="text-xs text-muted-foreground">
          Inclusive of all taxes
        </p>
      </div>

      {/* Stock Status */}
      {!isInStock ? (
        <p className="text-sm text-red-500 font-medium">Out of Stock</p>
      ) : availableStock > 0 && availableStock < 10 ? (
        <p className="text-sm text-orange-500 font-medium">
          Only {availableStock} left in stock
        </p>
      ) : null}

      {/* Delivery & Returns */}
      <div className="flex flex-wrap gap-4 pt-2 border-t border-border">
        {freeShipping && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Truck className="w-3.5 h-3.5" />
            <span>Free Shipping</span>
          </div>
        )}
        
       
      </div>
    </div>
  );
};

export default ProductInfo;