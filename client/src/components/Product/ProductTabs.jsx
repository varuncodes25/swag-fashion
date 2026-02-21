import { useState, useEffect } from "react";
import { 
  Truck, Package, Award, 
  Ruler, Heart, Shield, 
  Clock, RefreshCw, Check,
  FileText, Info, Sparkles,
  Palette, Scissors, Droplet,
  Wind, Sun, Tag, Calendar
} from "lucide-react";

const ProductTabs = ({ product }) => {
  const [activeTab, setActiveTab] = useState("description");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const tabs = [
    { id: "description", label: "Description", icon: FileText },
    { id: "specifications", label: "Specifications", icon: Info },
    { id: "shipping", label: "Shipping & Returns", icon: Truck },
  ];

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
  {/* ✅ CARE INSTRUCTIONS - Mobile optimized */}
  {specs["Care Instructions"] && specs["Care Instructions"].length > 0 && (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
          <Droplet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary dark:text-primary-400" />
        </div>
        Care Instructions
      </h4>
      
      {/* Mobile: 1 column, Tablet: 2 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {specs["Care Instructions"].map((instruction, idx) => (
          <div 
            key={idx} 
            className="flex items-center gap-2 text-xs sm:text-sm bg-gray-50 dark:bg-gray-700/50 p-2 sm:p-2.5 rounded-lg border border-gray-100 dark:border-gray-600"
          >
            <span className="text-primary dark:text-primary-400 flex-shrink-0">
              {getCareIcon(instruction)}
            </span>
            {/* ✅ FIX: text-wrap aur overflow-hidden hata diya */}
            <span className="text-gray-700 dark:text-gray-300 break-words">
              {instruction}
            </span>
          </div>
        ))}
      </div>
    </div>
  )}

  {/* Package Details - Mobile optimized */}
  {specs["Package Details"] && (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
          <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary dark:text-primary-400" />
        </div>
        Package Details
      </h4>
      
      {/* Mobile: stacked, Tablet: flex row */}
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
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/50 px-4 sm:px-6">
  <div className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-hide py-3">
    {tabs.map((tab) => {
      const Icon = tab.icon;
      const isActive = activeTab === tab.id;
      
      return (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
            relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm
            transition-all duration-200 whitespace-nowrap
            ${isActive 
              ? "bg-primary text-white dark:text-black shadow-lg shadow-primary/20 dark:shadow-primary/10" 
              : `text-gray-600 dark:text-gray-300   /* ✅ Dark mode text light gray */
                 hover:bg-gray-100 dark:hover:bg-gray-700 
                 hover:text-gray-900 dark:hover:text-white`  /* ✅ Hover pe white */
            }
          `}
        >
          <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? "animate-pulse" : "text-gray-500 dark:text-gray-400"}`} />
          {tab.label}
        </button>
      );
    })}
  </div>
</div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Description Tab */}
        {activeTab === "description" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
              <div 
                dangerouslySetInnerHTML={{ __html: product.description }} 
                className="leading-relaxed text-gray-700 dark:text-gray-300"
              />
            </div>
            
            {product.fullDescription && product.fullDescription !== product.description && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary dark:text-primary-400" />
                  </div>
                  Detailed Description
                </h4>
                <div 
                  dangerouslySetInnerHTML={{ __html: product.fullDescription }}
                  className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-gray-600 dark:text-gray-400"
                />
              </div>
            )}
          </div>
        )}

        {/* Specifications Tab */}
        {activeTab === "specifications" && (
          <div className="animate-fadeIn">
            {renderSpecifications()}
          </div>
        )}

        {/* Shipping Tab */}
        {activeTab === "shipping" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 animate-fadeIn">
            {/* Shipping Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100 dark:border-blue-800">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md">
                  <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-base sm:text-lg mb-2 text-gray-900 dark:text-white">Shipping Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>Estimated delivery: <strong className="text-gray-900 dark:text-white">{product.estimatedDelivery || 7} business days</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Package className="w-4 h-4 flex-shrink-0" />
                      <span>Free shipping on orders above ₹999</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Returns Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-100 dark:border-green-800">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md">
                  <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-base sm:text-lg mb-2 text-gray-900 dark:text-white">Return Policy</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Package className="w-4 h-4 flex-shrink-0" />
                      <span><strong className="text-gray-900 dark:text-white">{product.returnPolicy || "7 Days Return"}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Truck className="w-4 h-4 flex-shrink-0" />
                      <span>Free pickup for returns</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Warranty Card */}
            <div className="lg:col-span-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-100 dark:border-purple-800">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-base sm:text-lg mb-2 text-gray-900 dark:text-white">Warranty</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Award className="w-4 h-4 flex-shrink-0" />
                      <span><strong className="text-gray-900 dark:text-white">{product.warranty || "No Warranty"}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>Manufacturer warranty applicable</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ProductTabs;