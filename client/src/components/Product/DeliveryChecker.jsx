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
      
      console.log("API Response:", response.data);
      
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
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800 shadow-sm">
      {/* Header with Deliver To */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Deliver To
          </span>
          {deliveryInfo ? (
            <>
              <span className="text-sm text-gray-900 dark:text-white font-semibold">
                {deliveryInfo.pincode}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 mx-1">•</span>
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                Free
              </span>
            </>
          ) : (
            <span className="text-sm text-gray-900 dark:text-white font-semibold">
              {pincode || "______"}
            </span>
          )}
        </div>
        {(pincode || deliveryInfo) && (
          <button 
            onClick={handleChangeClick}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors"
          >
            Change
          </button>
        )}
      </div>

      {/* Delivery Info Section - When available */}
      {deliveryInfo ? (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
          <Truck className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">
            Free delivery in {deliveryInfo.deliveryDays}–{parseInt(deliveryInfo.deliveryDays) + 1} days
          </span>
          <CheckCircle className="w-5 h-5 ml-auto text-green-500 dark:text-green-400 flex-shrink-0" />
        </div>
      ) : (
        <>
          {/* Instruction Text */}
          {!error && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Enter your pincode to check delivery date.
            </p>
          )}

          {/* Input and Check Button */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={pincode}
                onChange={handleChange}
                placeholder="Enter pincode"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                maxLength="6"
                disabled={loading}
              />
              {loading && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 text-blue-500 dark:text-blue-400 animate-spin" />
                </div>
              )}
            </div>
            <button
              onClick={handleCheck}
              disabled={pincode.length !== 6 || loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-blue-300 dark:disabled:bg-blue-800 text-white text-sm font-medium rounded-md transition-colors min-w-[70px] disabled:cursor-not-allowed"
            >
              {loading ? "..." : "Check"}
            </button>
          </div>
        </>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
          {error}
        </p>
      )}
    </div>
  );
};

export default DeliveryChecker;