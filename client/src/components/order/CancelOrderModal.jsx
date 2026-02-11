// src/components/custom/OrderData/CancelOrderModal.jsx
import React, { useState, useEffect } from "react";
import { XCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { cancelOrder } from "@/redux/slices/order";  // ✅ 1. clearCancelStatus HATAYA!

const CancelOrderModal = ({
  isOpen,
  onClose,
  orderId,
  onCancelSuccess  // ✅ 2. Callback receive karo
}) => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  
  // ✅ 3. refundStatus HATAYA - zaroorat nahi
  const { cancelLoading, cancelSuccess, error } = useSelector(
    (state) => state.order
  );

  const [cancelReason, setCancelReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const cancelReasons = [
    { id: "1", label: "Change of mind", value: "Change of mind" },
    { id: "2", label: "Size issue", value: "Size not available" },
    { id: "3", label: "Delivery time too long", value: "Delivery time too long" },
    { id: "4", label: "Found cheaper elsewhere", value: "Found cheaper elsewhere" },
    { id: "5", label: "Ordered by mistake", value: "Ordered by mistake" },
    { id: "6", label: "Other", value: "custom" },
  ];

  // ✅ 4. Reset state - SIRF local state reset karo, dispatch HATAO!
  useEffect(() => {
    if (isOpen) {
      setCancelReason("");
      setCustomReason("");
      setShowCustomInput(false);
      // ❌ dispatch(clearCancelStatus()) HATAYA!
    }
  }, [isOpen]);  // ✅ dispatch hatao dependency se

  // ✅ 5. SUCCESS HANDLER - SIRF callback call karo!
  useEffect(() => {
    if (cancelSuccess) {
      toast({
        title: "Success",
        description: "Order cancelled successfully",
        variant: "success",
      });
      
      onClose();  // Modal band karo
      
      // 🔥 PARENT KO BATAO - OrderActions clearCancelStatus karega!
      if (onCancelSuccess) {
        onCancelSuccess();
      }
      
      // ❌ dispatch(clearCancelStatus()) HATAYA!
    }
  }, [cancelSuccess, onClose, onCancelSuccess, toast]);  // ✅ dispatch hatao

  // ✅ 6. ERROR HANDLER - SIRF toast dikhao
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      // ❌ dispatch(clearCancelStatus()) HATAYA!
    }
  }, [error, toast]);  // ✅ dispatch hatao

  // Submit cancellation
  const handleSubmitCancellation = () => {
    // Validate reason
    let finalReason = cancelReason;
    
    if (cancelReason === "custom") {
      if (!customReason.trim()) {
        toast({
          title: "Error",
          description: "Please enter cancellation reason",
          variant: "destructive",
        });
        return;
      }
      finalReason = customReason;
    }
    
    if (!finalReason) {
      toast({
        title: "Error",
        description: "Please select cancellation reason",
        variant: "destructive",
      });
      return;
    }

    dispatch(cancelOrder({ orderId, reason: finalReason }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fadeScale">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Cancel Order
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please tell us the reason for cancellation
            </p>
          </div>
        </div>

        {/* Cancel Reasons */}
        <div className="space-y-3 mb-6">
          {cancelReasons.map((reason) => (
            <label
              key={reason.id}
              className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all
                ${cancelReason === reason.value 
                  ? reason.value === "custom"
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                    : "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
            >
              <input
                type="radio"
                name="cancelReason"
                value={reason.value}
                checked={cancelReason === reason.value}
                onChange={(e) => {
                  setCancelReason(e.target.value);
                  setShowCustomInput(e.target.value === "custom");
                }}
                className="w-4 h-4 text-red-600"
              />
              <span className="ml-3 text-gray-700 dark:text-gray-300">
                {reason.label}
              </span>
            </label>
          ))}

          {/* Custom Reason Input */}
          {showCustomInput && (
            <textarea
              placeholder="Please specify your reason..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl 
                focus:border-red-500 dark:focus:border-red-500 focus:ring-0
                bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              rows="3"
              autoFocus
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 
              text-gray-700 dark:text-gray-300 font-semibold rounded-xl
              hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            disabled={cancelLoading}
          >
            Back
          </button>
          <button
            onClick={handleSubmitCancellation}
            disabled={cancelLoading || !cancelReason}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 
              text-white font-semibold rounded-xl
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {cancelLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5" />
                Cancel Order
              </>
            )}
          </button>
        </div>

        {/* Note */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          ⚠️ This action cannot be undone. Order will be cancelled and stock will be restored.
        </p>
      </div>
    </div>
  );
};

export default CancelOrderModal;