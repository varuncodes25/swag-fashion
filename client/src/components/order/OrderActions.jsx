// src/components/order/OrderActions.jsx
import React, { useState } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  Download, 
  XCircle, 
  Truck,
  RefreshCw,
  Package,
  Sparkles
} from "lucide-react";
import CancelOrderModal from "./CancelOrderModal";
import { useSelector, useDispatch } from "react-redux";
import { clearCancelStatus } from "@/redux/slices/order";

const OrderActions = ({
  orderId,
  status: propStatus,
  loading = false,
  showActions = false,
  setShowActions,
  handleTrackOrder,
  handleDownloadInvoice,
  handleReturnOrder,
  hasTracking = false,
  hasInvoice = false,
  trackingUrl = null,
  invoiceUrl = null,
  onCancelSuccess
}) => {
  
  const dispatch = useDispatch();
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  const { currentOrder } = useSelector((state) => state.order);
  
  const status = currentOrder?.id === orderId || currentOrder?._id === orderId
    ? currentOrder.status
    : propStatus;

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const handleCancelSuccess = () => {
    dispatch(clearCancelStatus());
    if (onCancelSuccess) onCancelSuccess();
  };

  const getAvailableActions = () => {
    const actions = [];
    const statusUpper = status?.toUpperCase() || "PENDING";
    
    // Download Invoice Button
    if (hasInvoice || invoiceUrl) {
      actions.push({
        label: "Download Invoice",
        icon: <Download className="w-4 h-4" />,
        variant: "primary",
        onClick: handleDownloadInvoice,
        disabled: false,
        description: "Download PDF",
        gradient: "from-emerald-500 to-teal-600",
        shadow: "shadow-emerald-500/20"
      });
    }
    
    // Track Order Button
    if (hasTracking || (["SHIPPED", "IN_TRANSIT", "PROCESSING"].includes(statusUpper) && (trackingUrl || hasTracking))) {
      actions.push({
        label: loading ? "Loading..." : "Track Order",
        icon: <Truck className="w-4 h-4" />,
        variant: "info",
        onClick: handleTrackOrder,
        disabled: loading,
        description: "Track shipment",
        gradient: "from-primary to-primary/90",
        shadow: "shadow-blue-500/20"
      });
    }
    
    // Cancel Order Button
    if (["PENDING", "CONFIRMED", "PROCESSING"].includes(statusUpper)) {
      actions.push({
        label: "Cancel Order",
        icon: <XCircle className="w-4 h-4" />,
        variant: "danger",
        onClick: handleCancelClick,
        disabled: false,
        description: "Cancel order",
        gradient: "from-rose-500 to-pink-600",
        shadow: "shadow-rose-500/20"
      });
    }
    
    // Return/Exchange Button
    if (statusUpper === "DELIVERED") {
      actions.push({
        label: "Return/Exchange",
        icon: <RefreshCw className="w-4 h-4" />,
        variant: "warning",
        onClick: handleReturnOrder,
        disabled: false,
        description: "Return items",
        gradient: "from-amber-500 to-orange-600",
        shadow: "shadow-amber-500/20"
      });
    }
    
    return actions;
  };
  
  const availableActions = getAvailableActions();
  
 const ActionButton = ({ button }) => (
  <button
    onClick={button.onClick}
    disabled={button.disabled}
    className={`group relative px-5 py-3 md:px-6 md:py-4 font-medium rounded-xl md:rounded-2xl transition-all duration-300 
      hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed 
      flex items-center justify-center gap-3 md:gap-4 w-full
      bg-gradient-to-r ${button.gradient} text-white
      ${button.shadow} hover:shadow-xl
      before:absolute before:inset-0 before:rounded-xl md:before:rounded-2xl before:bg-white/20 
      before:opacity-0 before:transition-opacity before:duration-300
      hover:before:opacity-100 overflow-hidden`}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    
    <div className="relative z-10 flex items-center justify-center gap-3 md:gap-4">
      <div className="p-1.5 md:p-2 bg-white/20 rounded-lg md:rounded-xl group-hover:scale-110 transition-transform duration-300">
        {button.icon}
      </div>
      <span className="flex flex-col items-start">
        <span className="font-bold text-sm md:text-base tracking-wide">{button.label}</span>
        {button.description && (
          <span className="text-[11px] md:text-xs opacity-90 font-medium">{button.description}</span>
        )}
      </span>
    </div>
  </button>
);

  return (
   <div className="pt-6 md:pt-8 border-t-2 border-gray-100 dark:border-gray-800">
  {/* Header Section with Sparkle */}
  <div className="flex items-center justify-between mb-4 md:mb-6">
    <div className="flex items-center gap-2 md:gap-3">
      <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-amber-500" />
      <h3 className="font-bold text-foreground text-xl md:text-2xl bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
        Quick Actions
      </h3>
      <span className="text-xs md:text-sm font-medium text-gray-400 bg-muted px-2.5 py-1 md:px-3 md:py-1.5 rounded-full">
        {availableActions.length} available
      </span>
    </div>
  </div>

  {/* Actions Grid - Always visible */}
  <div className="mt-4 md:mt-6">
    {availableActions.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
        {availableActions.map((button, idx) => (
          <ActionButton key={idx} button={button} />
        ))}
      </div>
    ) : (
      <div className="text-center py-10 md:py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl md:rounded-2xl border border-border">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-20 animate-pulse" />
          <Package className="w-16 h-16 md:w-20 md:h-20 text-gray-400 mx-auto relative" />
        </div>
        <p className="text-muted-foreground font-semibold text-lg md:text-xl mt-4 md:mt-6">
          No Actions Available
        </p>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-500 mt-2 md:mt-3">
          Your order is currently {status?.toLowerCase()}
        </p>
        <p className="text-xs md:text-sm text-gray-400 dark:text-gray-600 mt-1 md:mt-2">
          Check back later for more options
        </p>
      </div>
    )}
  </div>

  {/* Cancel Modal */}
  <CancelOrderModal
    isOpen={showCancelModal}
    onClose={() => setShowCancelModal(false)}
    orderId={orderId}
    onCancelSuccess={handleCancelSuccess}
  />
</div>
  );
};

export default OrderActions;