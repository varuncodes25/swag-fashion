import PriceSection from "@/components/Product/PriceSection";
import { BadgeCheck, ShieldCheck, Star, Award, CheckCircle2 } from "lucide-react";

const ProductInfo = ({
  name,
  shortDesc,
  rating = 0,
  reviewCount = 0,
  soldCount = 0,
  brand,
  price,
  displayPrice,
  discount,
  isOfferActive
}) => {
  const showTrust = rating > 0 || reviewCount > 0 || soldCount > 0;

  return (
    <div className="space-y-7">
      {/* Product Header */}
      <div className="space-y-3">
        {/* Premium Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 rounded-full">
            <Award className="w-3 h-3" />
            Genuine Product
          </span>
          
          <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Authentic Seller
          </span>
        </div>
        
        {/* Product Title */}
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          {name}
        </h1>

        {/* Short Description */}
        {shortDesc && (
          <div className="pt-2">
            <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed border-l-3 border-blue-500 pl-4">
              {shortDesc}
            </p>
          </div>
        )}
      </div>

      {/* Trust Signals Card */}
      {showTrust && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800/80 p-5 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Rating Section */}
            {(rating > 0 || reviewCount > 0) && (
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
                  <Star className="w-6 h-6 text-orange-500 dark:text-orange-400" fill="currentColor" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">/5</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(rating)
                            ? 'text-orange-500 fill-orange-500'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      ({reviewCount.toLocaleString()})
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Sold Count */}
            {soldCount > 0 && (
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                  <BadgeCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {soldCount.toLocaleString()}+
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Verified Purchases
                  </p>
                </div>
              </div>
            )}

            {/* Quality Promise */}
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  Quality Checked
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Authentic Verification
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Brand Badge */}
      {brand && (
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900/80 rounded-xl px-4 py-2.5 border border-gray-200 dark:border-gray-700">
          <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
            <ShieldCheck className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Official Brand Partner
            </span>
            <span className="block text-sm font-bold text-gray-800 dark:text-gray-200">
              {brand}
            </span>
          </div>
        </div>
      )}

      {/* Price Card */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 space-y-5 shadow-sm">
        {/* Price Section */}
        <PriceSection
          price={price}
          displayPrice={displayPrice}
          discount={discount}
          isOfferActive={isOfferActive}
        />

        {/* Savings Highlight */}
        {isOfferActive && discount?.value && (
          <div className="flex flex-col gap-3 mt-4">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white px-4 py-2.5 rounded-xl w-fit shadow-md">
              <BadgeCheck className="w-4 h-4" />
              <span className="font-bold text-sm">
                {discount.type === "percentage"
                  ? `${discount.value}% OFF`
                  : `₹${discount.value} OFF`}
              </span>
              <span className="text-xs opacity-90">• Limited Time</span>
            </div>
            
            {/* Savings Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 text-xs">₹</span>
                </div>
                <span className="text-green-700 dark:text-green-300 font-medium">
                  Best Price Guaranteed
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-xs">✓</span>
                </div>
                <span className="text-blue-700 dark:text-blue-300 font-medium">
                  No Hidden Charges
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductInfo;