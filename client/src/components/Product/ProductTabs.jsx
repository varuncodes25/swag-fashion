import React ,{ useState, useEffect } from "react";
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
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Product Details */}
        {specs["Product Details"] && (
          <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h4 className="text-lg font-semibold mb-5 flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                <Info className="w-4 h-4 text-primary dark:text-primary-400" />
              </div>
              Product Details
            </h4>
            <div className="space-y-3">
              {Object.entries(specs["Product Details"]).map(([key, value]) => (
                <div key={key} className="flex items-start justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">{key}</span>
                  <span className="font-medium text-right ml-4 text-gray-900 dark:text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Right Column - Care Instructions & Package Details */}
        <div className="space-y-6">
          {/* CARE INSTRUCTIONS */}
          {specs["Care Instructions"] && specs["Care Instructions"].length > 0 && (
            <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                  <Droplet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary dark:text-primary-400" />
                </div>
                Care Instructions
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {specs["Care Instructions"].map((instruction, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-2 text-xs sm:text-sm bg-gray-50 dark:bg-gray-700/50 p-2 sm:p-2.5 rounded-lg border border-gray-100 dark:border-gray-600"
                  >
                    <span className="text-primary dark:text-primary-400 flex-shrink-0">
                      {getCareIcon(instruction)}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 break-words">
                      {instruction}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Package Details */}
          {specs["Package Details"] && (
            <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                  <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary dark:text-primary-400" />
                </div>
                Package Details
              </h4>
              
              <div className="space-y-2 sm:space-y-3">
                {Object.entries(specs["Package Details"]).map(([key, value]) => (
                  <div key={key} className="flex flex-col sm:flex-row sm:justify-between py-1.5 sm:py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{key}</span>
                    <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base break-words">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Row - Dimensions, Season & Occasion, Features */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dimensions & Weight */}
          {specs["Dimensions & Weight"] && (
            <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <div className="w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                  <Ruler className="w-4 h-4 text-primary dark:text-primary-400" />
                </div>
                Dimensions & Weight
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(specs["Dimensions & Weight"]).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                    <div className="text-xs text-gray-500 dark:text-gray-400">{key}</div>
                    <div className="font-semibold mt-1 text-gray-900 dark:text-white">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Season & Occasion */}
          {specs["Season & Occasion"] && (
            <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <div className="w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary dark:text-primary-400" />
                </div>
                Season & Occasion
              </h4>
              <div className="space-y-4">
                {Object.entries(specs["Season & Occasion"]).map(([key, value]) => (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-20">{key}:</span>
                    <div className="flex flex-wrap gap-2">
                      {value.split(", ").map((item, i) => (
                        <span 
                          key={i} 
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs border border-gray-200 dark:border-gray-600"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {specs["Features"] && specs["Features"].length > 0 && (
            <div className="md:col-span-2 bg-white dark:bg-gray-800/50 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <div className="w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary dark:text-primary-400" />
                </div>
                Features
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {specs["Features"].map((feature, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-2.5 rounded-lg border border-gray-100 dark:border-gray-600"
                  >
                    <Check className="w-3.5 h-3.5 text-green-500 dark:text-green-400 flex-shrink-0" />
                    <span className="text-sm truncate text-gray-700 dark:text-gray-300">{feature}</span>
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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
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
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div 
                    dangerouslySetInnerHTML={{ __html: product.fullDescription }}
                    className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-gray-600 dark:text-gray-400"
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
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
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Delivery</h4>
                    
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Estimated by</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(Date.now() + (product.estimatedDelivery || 7) * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { 
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </div>

                    {product.handlingTime && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Processing</span>
                        <span className="text-gray-900 dark:text-white">{product.handlingTime} business days</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Returns Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <RefreshCw className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Returns</h4>
                    
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Policy</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {product.returnPolicy || "7 Days Return"}
                      </span>
                    </div>

                    {product.returnWindow && (
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Return window</span>
                        <span className="text-gray-900 dark:text-white">{product.returnWindow} days</span>
                      </div>
                    )}

                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                      👕 Items must be unworn, unwashed with original tags attached
                    </div>
                  </div>
                </div>
              </div>

              {/* Warranty Card */}
              {product.warranty && product.warranty !== "No Warranty" && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Warranty</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{product.warranty}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Seller Info */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {product.brand || "SWAG FASHION"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
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