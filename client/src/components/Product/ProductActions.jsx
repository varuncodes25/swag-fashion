import { CreditCard, ShoppingCart } from "lucide-react";

const ProductActions = ({
  stock,
  onAddToCart,
  onBuyNow,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          type="button"
          className="btn-buy-now flex-1 px-6 py-3 text-sm sm:text-base"
          onClick={onBuyNow}
          disabled={stock === 0}
        >
          <CreditCard className="h-4 w-4" />
          Buy Now
        </button>

        <button
          type="button"
          className="btn-add-cart flex-1 px-6 py-3 text-sm sm:text-base"
          onClick={onAddToCart}
          disabled={stock === 0}
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductActions;
