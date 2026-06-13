// components/Product/DeliveryChecker.jsx
import React, { useState } from "react";
import { MapPin, Truck, Loader2, CheckCircle } from "lucide-react";
import apiClient from "@/api/axiosConfig";

const DeliveryChecker = () => {
  const [pincode, setPincode] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (pincode.length !== 6) {
      setError("Please enter a valid 6-digit pincode");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const response = await apiClient.post("/delivery-estimate", { pincode });
      
     
      
      if (response.data.success) {
        if (response.data.available) {
          setDeliveryInfo({
            pincode: response.data.pincode,
            estimatedDate: response.data.estimatedDate,
            deliveryDays: response.data.deliveryDays,
            message: response.data.message
          });
        } else {
          setError("We don't deliver to this pincode yet");
          setDeliveryInfo(null);
        }
        setIsChecked(true);
      }
    } catch (err) {
      console.error("Delivery check error:", err);
      setError(err.response?.data?.message || "Failed to check delivery");
      setDeliveryInfo(null);
      setIsChecked(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(value);
    setIsChecked(false);
    setDeliveryInfo(null);
    setError("");
  };

  const handleChangeClick = () => {
    setPincode("");
    setIsChecked(false);
    setDeliveryInfo(null);
    setError("");
  };

  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-sm lg:p-4">
      <div className="mb-2 flex items-center justify-between lg:mb-3">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground lg:h-4 lg:w-4" />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 lg:text-sm">
            Deliver To
          </span>
          {deliveryInfo ? (
            <>
              <span className="text-sm text-foreground font-semibold">
                {deliveryInfo.pincode}
              </span>
              <span className="text-xs text-muted-foreground mx-1">•</span>
              <span className="text-xs text-success font-medium">
                Free
              </span>
            </>
          ) : (
            <span className="text-sm text-foreground font-semibold">
              {pincode || "______"}
            </span>
          )}
        </div>
        {(pincode || deliveryInfo) && (
          <button 
            onClick={handleChangeClick}
            className="text-xs text-primary dark:text-primary hover:underline font-medium transition-colors"
          >
            Change
          </button>
        )}
      </div>

      {/* Delivery Info Section - When available */}
      {deliveryInfo ? (
        <div className="flex items-center gap-2 rounded-md bg-green-50 p-2 text-success dark:bg-green-900/20 lg:p-3">
          <Truck className="h-3.5 w-3.5 shrink-0 lg:h-4 lg:w-4" />
          <span className="text-xs lg:text-sm">
            Free delivery in {deliveryInfo.deliveryDays}–{parseInt(deliveryInfo.deliveryDays) + 1} days
          </span>
          <CheckCircle className="w-5 h-5 ml-auto text-green-500 dark:text-green-400 flex-shrink-0" />
        </div>
      ) : (
        <>
          {/* Instruction Text */}
          {!error && (
            <p className="mb-2 text-[11px] text-muted-foreground lg:mb-3 lg:text-xs">
              Enter pincode to check delivery.
            </p>
          )}

          <div className="mb-2 flex gap-2 lg:mb-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={pincode}
                onChange={handleChange}
                placeholder="Enter pincode"
                className="w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground transition-colors placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary dark:placeholder-gray-500 dark:focus:ring-blue-400 lg:px-3 lg:py-2 lg:text-sm"
                maxLength="6"
                disabled={loading}
              />
              {loading && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 text-blue-500 dark:text-primary animate-spin" />
                </div>
              )}
            </div>
            <button
              onClick={handleCheck}
              disabled={pincode.length !== 6 || loading}
              className="btn-premium min-w-[60px] px-3 py-1.5 text-xs lg:min-w-[70px] lg:px-4 lg:py-2 lg:text-sm"
            >
              {loading ? "..." : "Check"}
            </button>
          </div>
        </>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-xs text-destructive bg-red-50 dark:bg-red-900/20 p-2 rounded">
          {error}
        </p>
      )}
    </div>
  );
};

export default DeliveryChecker;