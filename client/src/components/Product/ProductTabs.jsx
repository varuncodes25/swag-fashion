import { useState } from "react";
import { Truck, Package, Ruler, Award } from "lucide-react";

const ProductTabs = ({ product }) => {
  const [activeTab, setActiveTab] = useState("description");

  const tabs = [
    { id: "description", label: "Description" },
    { id: "specifications", label: "Specifications" },
    { id: "shipping", label: "Shipping & Returns" },
    { id: "reviews", label: "Reviews" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {activeTab === "description" && (
          <div className="space-y-4">
            <div dangerouslySetInnerHTML={{ __html: product.description }} />
            {product.fullDescription && (
              <div dangerouslySetInnerHTML={{ __html: product.fullDescription }} />
            )}
            
            {product.features && product.features.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3">Key Features</h4>
                <ul className="grid grid-cols-2 gap-2">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === "specifications" && product.specifications && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.entries(product.specifications).map(([category, details]) => (
              <div key={category} className="space-y-4">
                <h4 className="text-lg font-semibold">{category}</h4>
                <div className="space-y-3">
                  {typeof details === "object" && !Array.isArray(details) ? (
                    Object.entries(details).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">{key}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))
                  ) : Array.isArray(details) ? (
                    <ul className="space-y-2">
                      {details.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>{details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "shipping" && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold">Shipping Information</h4>
                <p className="text-gray-600 mt-1">
                  Estimated delivery: {product.estimatedDelivery || 7} business days
                </p>
                <p className="text-gray-600">
                  Free shipping on orders above ₹999
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold">Return Policy</h4>
                <p className="text-gray-600 mt-1">
                  {product.returnPolicy || "7 Days Return Available"}
                </p>
                <p className="text-gray-600">
                  Easy return process with free pickup
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold">Warranty</h4>
                <p className="text-gray-600 mt-1">
                  {product.warranty || "No Warranty"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;