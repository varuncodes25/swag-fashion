// src/components/custom/OrderData/OrderData.jsx
import React, { useState, useMemo, useEffect } from "react";
import ProductItem from "../order/ProductItem";
import OrderSummary from "../../components/order/OrderSummary";
import OrderActions from "../../components/order/OrderActions";
import TrackingSection from "../../components/order/TrackingSection";
import { getStatusIcon, getStatusColor, formatDate } from "@/utils/orderHelpers";

const OrderData = ({
  id,              // ORDER ID
  orderNumber,
  date,
  status = "PENDING",
  items = [],
  pricing = {},
  shipping = {},
  summary = {},
  tracking = {},    // TRACKING OBJECT
  invoice = {},     // INVOICE OBJECT
  shiprocket = {},  // SHIPROCKET DETAILS
  onCancel,
}) => {
  const [trackingData, setTrackingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Extract data directly
  const amount = pricing?.totalAmount || 0;
  const subtotal = pricing?.subtotal || 0;
  const shippingCharge = pricing?.shippingCharge || 0;
  const createdAt = date;
  const _id = id;

  // Get tracking info from props
  const awb = tracking?.awb || shiprocket?.awb || null;
  const courierName = tracking?.courierName || shiprocket?.courierName || null;
  const trackingUrl = tracking?.trackingUrl || shiprocket?.trackingUrl || null;
  const isShipped = tracking?.isShipped || !!awb;
  
  // Get invoice info from props
  const invoiceUrl = invoice?.url || shiprocket?.invoiceUrl || null;
  const irnNo = invoice?.irnNo || shiprocket?.irnNo || null;
  const isInvoiceGenerated = invoice?.isGenerated || !!invoiceUrl;

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

  // Track order handler - opens tracking URL
  const handleTrackOrder = async () => {
    if (trackingUrl) {
      window.open(trackingUrl, '_blank', 'noopener,noreferrer');
    } else if (awb) {
      const shiprocketTrackUrl = `https://shiprocket.co/tracking/${awb}`;
      window.open(shiprocketTrackUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert("Tracking information not available yet. Please check back later.");
    }
  };

  // Download invoice handler
  const handleDownloadInvoice = async () => {
    if (invoiceUrl) {
      try {
        window.open(invoiceUrl, '_blank', 'noopener,noreferrer');
      } catch (error) {
        console.error("Failed to download invoice:", error);
        alert("Failed to download invoice. Please try again.");
      }
    } else {
      alert("Invoice not available yet. Please check back later.");
    }
  };

  const handleCancelClick = () => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      onCancel && onCancel();
    }
  };

  // Return/exchange handler
  const handleReturnOrder = () => {
    alert("Return/exchange to be implemented");
  };

  const handleCancelSuccess = (data) => {
    if (onCancel) {
      onCancel(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* ❌ REMOVED - Tracking Info Banner */}
      {/* ❌ REMOVED - Invoice Available Banner */}
      {/* All actions now handled by OrderActions component below */}

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

      {/* Order Actions Section - All buttons here */}
      <OrderActions
        orderId={id}
        status={status}
        loading={loading}
        showActions={showActions}
        setShowActions={setShowActions}
        handleTrackOrder={handleTrackOrder}
        handleDownloadInvoice={handleDownloadInvoice}
        handleReturnOrder={handleReturnOrder}
        onCancelSuccess={handleCancelSuccess}
        hasTracking={isShipped}
        hasInvoice={isInvoiceGenerated}
        trackingUrl={trackingUrl}
        invoiceUrl={invoiceUrl}
      />

      {/* Tracking Section - for detailed tracking history */}
      {showTracking && trackingData.length > 0 && (
        <TrackingSection trackingData={trackingData} />
      )}
    </div>
  );
};

export default OrderData;