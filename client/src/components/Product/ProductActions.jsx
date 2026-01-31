import { Button } from "@/components/ui/button";
import { Heart, Share2, Shield, CreditCard } from "lucide-react";
import { useState } from "react";

const ProductActions = ({
  stock,
  onAddToCart,
  onBuyNow,
  paymentOptions,
  highlights,
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <div className="space-y-4">
      {/* CTA Buttons */}
      <div className="flex gap-3">
        <Button
          size="lg"
          className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
          onClick={onBuyNow}
          disabled={stock === 0}
        >
          <CreditCard className="mr-2 h-5 w-5" />
          Buy Now
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="flex-1 border-2"
          onClick={onAddToCart}
          disabled={stock === 0}
        >
          Add to Cart
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={() => setIsWishlisted(!isWishlisted)}
          className={`border-2 ${
            isWishlisted
              ? "bg-red-50 border-red-200 text-red-600"
              : "hover:bg-gray-100"
          }`}
        >
          <Heart
            className={`h-5 w-5 ${
              isWishlisted ? "fill-red-500" : ""
            }`}
          />
        </Button>
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <Shield className="h-5 w-5 text-green-600" />
        <span className="text-sm text-green-700 dark:text-green-400">
          100% Secure Payment | SSL Encrypted
        </span>
      </div>

      {/* Share & Payment Options */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="ghost" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <div className="flex items-center gap-2">
          {["visa", "mastercard", "razorpay", "upi"].map((method) => (
            <div
              key={method}
              className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center"
            >
              <span className="text-xs font-medium uppercase">{method}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductActions;