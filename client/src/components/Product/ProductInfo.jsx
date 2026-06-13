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
    <div className="space-y-2 lg:space-y-4">
      <h1 className="text-lg font-bold leading-snug text-foreground lg:text-2xl">
        {name}
      </h1>

      {reviewCount > 0 && (
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 lg:h-4 lg:w-4 ${
                  i < Math.floor(rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-medium lg:text-sm">{rating?.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground lg:text-sm">
            ({reviewCount} reviews)
          </span>
        </div>
      )}

      <div className="space-y-0.5">
        <div className="flex flex-wrap items-baseline gap-1.5 lg:gap-2">
          <span className="text-2xl font-bold text-foreground lg:text-3xl">
            ₹{finalPrice?.toFixed(0)}
          </span>

          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through lg:text-lg">
              ₹{price?.toFixed(0)}
            </span>
          )}

          {hasDiscount && (
            <span className="rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white lg:px-2 lg:py-1 lg:text-xs">
              {discount}% OFF
            </span>
          )}
        </div>

        {hasDiscount && savings > 0 && (
          <p className="text-xs font-medium text-green-600 lg:text-sm">
            You save: ₹{savings.toFixed(0)} ({discount}% off)
          </p>
        )}

        <p className="text-[11px] text-muted-foreground lg:text-xs">
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