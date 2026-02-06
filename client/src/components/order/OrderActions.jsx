// src/components/custom/OrderData/OrderActions.jsx
import React from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  Download, 
  XCircle, 
  Truck,
  RefreshCw,
  Package 
} from "lucide-react";

const OrderActions = ({
  status,
  loading = false,
  showActions = false,
  setShowActions,
  handleTrackOrder,
  handleCancelClick,
  handleDownloadInvoice,
  handleReturnOrder,
}) => {
  
  // Determine which actions are available based on status
  const getAvailableActions = () => {
    const actions = [];
    const statusUpper = status?.toUpperCase() || "PENDING";
    
    // Always show download invoice
    actions.push({
      label: "Download Invoice",
      icon: <Download className="w-4 h-4" />,
      variant: "primary",
      onClick: handleDownloadInvoice,
      disabled: false
    });
    
    // Track order for shipped orders
    if (["SHIPPED", "IN_TRANSIT"].includes(statusUpper)) {
      actions.push({
        label: loading ? "Loading..." : "Track Order",
        icon: <Truck className="w-4 h-4" />,
        variant: "secondary",
        onClick: handleTrackOrder,
        disabled: loading
      });
    }
    
    // Cancel order for cancellable statuses
    if (["PENDING", "CONFIRMED", "PROCESSING"].includes(statusUpper)) {
      actions.push({
        label: "Cancel Order",
        icon: <XCircle className="w-4 h-4" />,
        variant: "danger",
        onClick: handleCancelClick,
        disabled: false
      });
    }
    
    // Return/Exchange for delivered orders
    if (statusUpper === "DELIVERED") {
      actions.push({
        label: "Return/Exchange",
        icon: <RefreshCw className="w-4 h-4" />,
        variant: "warning",
        onClick: handleReturnOrder,
        disabled: false
      });
    }
    
    return actions;
  };
  
  const availableActions = getAvailableActions();
  
  // Button variant classes
  const buttonVariantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-orange-600 hover:bg-orange-700 text-white"
  };
  
  const ActionButton = ({ button }) => (
    <button
      onClick={button.onClick}
      disabled={button.disabled}
      className={`px-5 py-3 font-semibold rounded-xl transition-all duration-200 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 flex-1 min-w-[140px] ${
        buttonVariantClasses[button.variant]
      }`}
    >
      {button.icon}
      {button.label}
    </button>
  );

  return (
    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
      <div
        className="flex items-center justify-between cursor-pointer md:cursor-default"
        onClick={() => window.innerWidth < 768 && setShowActions(!showActions)}
      >
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
          Order Actions
        </h3>

        <button className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
          {showActions ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className={`${showActions ? "block" : "hidden md:block"} mt-4 md:mt-0`}>
        {availableActions.length > 0 ? (
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            {availableActions.map((button, idx) => (
              <ActionButton key={idx} button={button} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              No actions available for this order status
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderActions;