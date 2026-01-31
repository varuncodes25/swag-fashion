import { Button } from "@/components/ui/button";
import { ShoppingCart, CreditCard } from "lucide-react";

const MobileStickyCTA = ({
  product,
  displayPrice,
  isOfferActive,
  onAddToCart,
  onBuyNow,
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-xl p-4 z-50">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              ₹{Number(displayPrice).toFixed(2)}
            </span>
            {isOfferActive && (
              <span className="text-sm text-gray-400 line-through">
                ₹{Number(product.price).toFixed(2)}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Inclusive of all taxes</p>
        </div>
        
        <div className="flex gap-2">
          {/* Add to Cart Button - Amazon Yellow Color */}
          <Button
            size="sm"
            variant="outline"
            className="
              gap-2 
              bg-amber-500 
              hover:bg-amber-600 
              dark:bg-amber-600 
              dark:hover:bg-amber-700 
              border-amber-500 
              hover:border-amber-600 
              dark:border-amber-600 
              dark:hover:border-amber-700
              text-white
              hover:text-white
              dark:text-white
              dark:hover:text-white
              font-semibold
              shadow-sm
              hover:shadow
              transition-all
            "
            onClick={onAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="h-4 w-4" />
            Add
          </Button>
          
          {/* Buy Now Button - Amazon Orange Color */}
          <Button
            size="sm"
            className="
              gap-2 
              bg-orange-500 
              hover:bg-orange-600 
              dark:bg-orange-600 
              dark:hover:bg-orange-700 
              text-white
              hover:text-white
              dark:text-white
              dark:hover:text-white
              font-semibold
              border-0
              shadow-sm
              hover:shadow
              transition-all
            "
            onClick={onBuyNow}
            disabled={product.stock === 0}
          >
            <CreditCard className="h-4 w-4" />
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileStickyCTA;