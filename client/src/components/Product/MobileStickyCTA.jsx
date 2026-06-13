import { ShoppingCart, CreditCard } from "lucide-react";

const MobileStickyCTA = ({
  product,
  displayPrice,
  isOfferActive,
  onAddToCart,
  onBuyNow,
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-card/95 p-2.5 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-foreground">
              ₹{Number(displayPrice).toFixed(2)}
            </span>
            {isOfferActive && (
              <span className="text-xs text-gray-400 line-through">
                ₹{Number(product.price).toFixed(2)}
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">Inclusive of all taxes</p>
        </div>

        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            className="btn-add-cart h-9 px-3"
            onClick={onAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Add
          </button>

          <button
            type="button"
            className="btn-buy-now h-9 px-3"
            onClick={onBuyNow}
            disabled={product.stock === 0}
          >
            <CreditCard className="h-3.5 w-3.5" />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileStickyCTA;
