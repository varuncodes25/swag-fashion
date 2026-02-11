import { Button } from "@/components/ui/button";
import { Heart, Share2, Shield, CreditCard, ShoppingCart } from "lucide-react";
import { useState } from "react";

// ✅ SUPER SLOW SHAKE ANIMATION - 5 SECONDS
const shakeAnimation = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-3px); }
    40%, 80% { transform: translateX(3px); }
  }
  .animate-shake {
    animation: shake 3s ease-in-out infinite;
  }
  .animate-shake:hover {
    animation: none;
  }
`;

const ProductActions = ({
  stock,
  onAddToCart,
  onBuyNow,
  paymentOptions,
  highlights,
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <>
      {/* ✅ STYLE TAG - ANIMATION DEFINITION */}
      <style>{shakeAnimation}</style>

      <div className="space-y-4">
        {/* CTA Buttons */}
        <div className="flex gap-3">
          {/* ✅ BUY NOW BUTTON - SUPER SLOW SHAKE EFFECT */}
          <Button
            size="lg"
            className="
              gap-3 px-8 py-6 text-base
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
              shadow-sm hover:shadow
              transition-all
              animate-shake
              hover:animate-none
              disabled:animate-none
            "
            onClick={onBuyNow}
            disabled={stock === 0}
          >
            <CreditCard className="h-4 w-4" />
            Buy Now
          </Button>

          {/* Add to Cart Button */}
          <Button
            size="lg"
            className="
              gap-1 px-8 py-6 text-base
              bg-amber-500 
              hover:bg-amber-600 
              dark:bg-amber-600 
              dark:hover:bg-amber-700 
              text-white
              hover:text-white
              dark:text-white
              dark:hover:text-white
              font-semibold
              rounded-lg
              shadow-md hover:shadow-lg
              transition-all duration-300
              hover:scale-[1.02]
              active:scale-[0.98]
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            "
            onClick={onAddToCart}
            disabled={stock === 0}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </>
  );
};

export default ProductActions;