// src/components/custom/OrderData/OrderData.jsx
import React, { useState, useMemo, useEffect } from "react";
import ProductItem from "../order/ProductItem";
import OrderSummary from "../../components/order/OrderSummary";
import OrderActions from "../../components/order/OrderActions";
import TrackingSection from "../../components/order/TrackingSection";
import { getStatusIcon, getStatusColor, formatDate } from "@/utils/orderHelpers";

const OrderData = ({
  id,              // ✅ YEH HAI ORDER ID!
  orderNumber,
  date,
  status = "PENDING",
  items = [],
  pricing = {},
  shipping = {},
  summary = {},
  onCancel,
}) => {
  const [trackingData, setTrackingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Extract data directly without mapping
  const amount = pricing?.totalAmount || 0;
  const subtotal = pricing?.subtotal || 0;
  const shippingCharge = pricing?.shippingCharge || 0;
  const createdAt = date;
  const _id = id;

  // Memoized calculations
  const formattedStatus = useMemo(
    () => status.charAt(0) + status.slice(1).toLowerCase(),
    [status]
  );

  const statusIcon = useMemo(() => getStatusIcon(status), [status]);

  const statusDisplay = useMemo(
    () => (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(
          status
        )}`}
      >
        {statusIcon}
        {formattedStatus}
      </div>
    ),
    [status, statusIcon, formattedStatus]
  );

  // Track order handler
  const handleTrackOrder = async () => {
    if (showTracking) {
      setShowTracking(false);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      // Implement your tracking API
      // const data = await orderApi.trackOrder(id, token);
      // setTrackingData(data);
      setShowTracking(true);
    } catch (error) {
      alert(error.message || "Failed to fetch tracking data");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      onCancel && onCancel();
    }
  };

  // Download invoice handler
  const handleDownloadInvoice = async () => {
    try {
      // Implement invoice download
      alert("Invoice download to be implemented");
    } catch (error) {
      console.error(error);
    }
  };

  // Return/exchange handler
  const handleReturnOrder = () => {
    alert("Return/exchange to be implemented");
  };

  // ✅ CANCEL SUCCESS HANDLER
  const handleCancelSuccess = (data) => {
    console.log("Order cancelled successfully:", data);
    // Parent component ko batao (OrderDetails.jsx)
    if (onCancel) {
      onCancel(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Products List Section */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between px-2 sm:px-0">
          <h3 className="font-semibold text-foreground text-base sm:text-lg">
            Order Items
          </h3>
          <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {items.map((item, idx) => (
            <ProductItem 
              key={item.productId || idx} 
              item={item}
            />
          ))}
        </div>
      </div>

      {/* Order Summary Section */}
      <OrderSummary
        createdAt={createdAt}
        statusIcon={statusIcon}
        statusDisplay={statusDisplay}
        subtotal={subtotal}
        shippingCharge={shippingCharge}
        amount={amount}
        showBreakdown={showBreakdown}
        setShowBreakdown={setShowBreakdown}
      />

      {/* Order Actions Section - ✅ FIXED: orderId and onCancelSuccess PASS KARO! */}
      <OrderActions
        orderId={id}                    // ✅ ORDER ID PASS KARO!
        status={status}
        loading={loading}
        showActions={showActions}
        setShowActions={setShowActions}
        handleTrackOrder={handleTrackOrder}
        handleDownloadInvoice={handleDownloadInvoice}
        handleReturnOrder={handleReturnOrder}
        onCancelSuccess={handleCancelSuccess}  // ✅ CANCEL SUCCESS CALLBACK!
      />

      {/* Tracking Section */}
      {showTracking && (
        <TrackingSection trackingData={trackingData} />
      )}
    </div>
  );
};

export default OrderData;