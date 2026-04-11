import React, { useState, useEffect } from "react";
import {
  Truck, Package, Award,
  Ruler, Heart, Shield,
  Clock, RefreshCw, Check,
  FileText, Info, Sparkles,
  Palette, Scissors, Droplet,
  Wind, Sun, Tag, Calendar,
  ChevronDown, ChevronUp
} from "lucide-react";

const ProductTabs = ({ product }) => {
  const [mounted, setMounted] = useState(false);
  const [openSections, setOpenSections] = useState({
    description: false,
    specifications: false,
    shipping: false
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  const isValidValue = (value) => {
    if (!value) return false;

    if (typeof value === "string") {
      const v = value.trim().toLowerCase();
      return !["not applicable", "n/a", "na", ""].includes(v);
    }

    return true;
  };
  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getCareIcon = (instruction) => {
    const icons = {
      "Machine Wash": <Droplet className="w-3.5 h-3.5" />,
      "Hand Wash": <Droplet className="w-3.5 h-3.5" />,
      "Dry Clean Only": <Wind className="w-3.5 h-3.5" />,
      "Do Not Bleach": <Scissors className="w-3.5 h-3.5" />,
      "Tumble Dry Low": <Wind className="w-3.5 h-3.5" />,
      "Line Dry": <Sun className="w-3.5 h-3.5" />,
      "Iron Low Heat": <Wind className="w-3.5 h-3.5" />,
      "Do Not Iron": <Scissors className="w-3.5 h-3.5" />,
      "Dry Flat": <Wind className="w-3.5 h-3.5" />,
    };
    return icons[instruction] || <Check className="w-3.5 h-3.5" />;
  };

 const renderSpecifications = () => {
  const specs = product.specifications || {};

  const productDetails = Object.entries(specs["Product Details"] || {})
    .filter(([_, value]) => isValidValue(value));

  const careInstructions = (specs["Care Instructions"] || [])
    .filter((item) => isValidValue(item));

  const packageDetails = Object.entries(specs["Package Details"] || {})
    .filter(([_, value]) => isValidValue(value));

  const dimensions = Object.entries(specs["Dimensions & Weight"] || {})
    .filter(([_, value]) => isValidValue(value));

  const seasonOccasion = Object.entries(specs["Season & Occasion"] || {})
    .filter(([_, value]) => isValidValue(value));

  const features = (specs["Features"] || [])
    .filter((item) => isValidValue(item));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Product Details */}
      {productDetails.length > 0 && (
        <div className="bg-card/60 rounded-xl p-6 shadow-sm border border-border">
          <h4 className="text-lg font-semibold mb-4 text-foreground">
            Product Details
          </h4>

          {productDetails.map(([key, value]) => (
            <div key={key} className="flex justify-between py-2 border-b border-border last:border-0">
              <span className="text-muted-foreground text-sm">
                {key}
              </span>
              <span className="font-medium text-foreground text-sm">
                {value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Right Column */}
      <div className="space-y-6">

        {/* Care Instructions */}
        {careInstructions.length > 0 && (
          <div className="bg-card/60 rounded-xl p-6 shadow-sm border border-border">
            <h4 className="text-lg font-semibold mb-4 text-foreground">
              Care Instructions
            </h4>

            <div className="grid grid-cols-2 gap-3">
              {careInstructions.map((item, i) => (
                <div
                  key={i}
                  className="text-sm bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 p-2 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Package Details */}
        {packageDetails.length > 0 && (
          <div className="bg-card/60 rounded-xl p-6 shadow-sm border border-border">
            <h4 className="text-lg font-semibold mb-4 text-foreground">
              Package Details
            </h4>

            {packageDetails.map(([key, value]) => (
              <div key={key} className="flex justify-between py-2 border-b border-border last:border-0">
                <span className="text-muted-foreground text-sm">
                  {key}
                </span>
                <span className="text-foreground text-sm font-medium">
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Dimensions */}
        {dimensions.length > 0 && (
          <div className="bg-card/60 rounded-xl p-6 shadow-sm border border-border">
            <h4 className="text-lg font-semibold mb-4 text-foreground">
              Dimensions & Weight
            </h4>

            <div className="grid grid-cols-2 gap-3">
              {dimensions.map(([key, value]) => (
                <div
                  key={key}
                  className="bg-gray-100 dark:bg-gray-700/60 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="text-xs text-muted-foreground">
                    {key}
                  </div>
                  <div className="font-semibold text-foreground">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Season */}
        {seasonOccasion.length > 0 && (
          <div className="bg-card/60 rounded-xl p-6 shadow-sm border border-border">
            <h4 className="text-lg font-semibold mb-4 text-foreground">
              Season & Occasion
            </h4>

            {seasonOccasion.map(([key, value]) => (
              <div key={key} className="mb-3">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {key}:
                </span>

                <div className="flex flex-wrap gap-2 mt-2">
                  {value.split(", ").map((item, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs border border-border"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Features */}
        {features.length > 0 && (
          <div className="md:col-span-2 bg-card/60 rounded-xl p-6 shadow-sm border border-border">
            <h4 className="text-lg font-semibold mb-4 text-foreground">
              Features
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {features.map((item, i) => (
                <div
                  key={i}
                  className="bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

  return (
    <div className="bg-background dark:bg-background rounded-2xl shadow-lg border border-border overflow-hidden transition-colors duration-200">
      {/* ===== ACCORDION ===== */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">

        {/* Description Accordion */}
        <div className="p-4 sm:p-6">
          <button
            onClick={() => toggleSection('description')}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Description
              </h3>
            </div>
            {openSections.description ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {openSections.description && (
            <div className="mt-4 animate-slideDown">
              <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                <div
                  dangerouslySetInnerHTML={{ __html: product.description }}
                  className="leading-relaxed text-gray-700 dark:text-gray-300"
                />
              </div>

              {product.fullDescription && product.fullDescription !== product.description && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div
                    dangerouslySetInnerHTML={{ __html: product.fullDescription }}
                    className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-muted-foreground"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Specifications Accordion */}
        <div className="p-4 sm:p-6">
          <button
            onClick={() => toggleSection('specifications')}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Specifications
              </h3>
            </div>
            {openSections.specifications ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {openSections.specifications && (
            <div className="mt-4 animate-slideDown">
              {renderSpecifications()}
            </div>
          )}
        </div>

        {/* Shipping Accordion */}
        <div className="p-4 sm:p-6">
          <button
            onClick={() => toggleSection('shipping')}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Delivery & Returns
              </h3>
            </div>
            {openSections.shipping ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {openSections.shipping && (
            <div className="mt-4 space-y-4 animate-slideDown">
              {/* Delivery Card */}
              <div className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 dark:bg-blue-900/20 rounded-lg">
                    <Truck className="h-5 w-5 text-primary dark:text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-3">Delivery</h4>

                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Estimated by</span>
                      <span className="font-medium text-foreground">
                        {new Date(Date.now() + (product.estimatedDelivery || 7) * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </div>

                    {product.handlingTime && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Processing</span>
                        <span className="text-foreground">{product.handlingTime} business days</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Returns Card */}
              <div className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <RefreshCw className="h-5 w-5 text-success" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-3">Returns</h4>

                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Policy</span>
                      <span className="font-medium text-success">
                        {product.returnPolicy || "7 Days Return"}
                      </span>
                    </div>

                    {product.returnWindow && (
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Return window</span>
                        <span className="text-foreground">{product.returnWindow} days</span>
                      </div>
                    )}

                    <div className="mt-3 text-xs text-muted-foreground bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                      👕 Items must be unworn, unwashed with original tags attached
                    </div>
                  </div>
                </div>
              </div>

              {/* Warranty Card */}
              {product.warranty && product.warranty !== "No Warranty" && (
                <div className="bg-card rounded-lg border border-border p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Shield className="h-5 w-5 text-primary dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-2">Warranty</h4>
                      <p className="text-sm text-muted-foreground">{product.warranty}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Seller Info */}
              <div className="bg-muted/40/50 rounded-lg p-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {product.brand || "SWAG FASHION"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ★ {product.sellerRating || "4.5"} Seller Rating
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProductTabs;