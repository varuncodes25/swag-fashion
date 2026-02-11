// src/components/custom/OrderData/OrderSummary.jsx
import React from "react";
import { IndianRupee, Calendar, ChevronDown, Truck, CheckCircle, Package } from "lucide-react";
import { formatPrice, formatDate, StatusDisplay } from "../../utils/orderHelpers";

const OrderSummary = ({
  createdAt,
  status = "PENDING",
  subtotal = 0,
  shippingCharge = 0,
  amount = 0,
  couponDiscount = 0,
  taxAmount = 0,
  showBreakdown,
  setShowBreakdown,
}) => {
  // Status icon
  const getStatusIcon = () => {
    switch(status?.toUpperCase()) {
      case "SHIPPED":
        return <Truck className="w-4 h-4" />;
      case "DELIVERED":
        return <CheckCircle className="w-4 h-4" />;
      case "CANCELLED":
        return <span className="w-4 h-4 flex items-center justify-center">✕</span>;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <div>
      <h3 className="font-semibold text-foreground text-lg mb-4">
        Order Summary
      </h3>

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        {/* Mobile: Stacked Cards View */}
        <div className="sm:hidden space-y-4 p-4">
          {/* Date Card */}
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-muted-foreground">Order Date</span>
            </div>
            <span className="font-semibold text-foreground">
              {formatDate(createdAt)}
            </span>
          </div>

          {/* Status Card */}
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-500/10 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-500/20 rounded-lg flex items-center justify-center">
                {getStatusIcon()}
              </div>
              <span className="text-muted-foreground">Status</span>
            </div>
            <StatusDisplay status={status} />
          </div>

          {/* Shipping Card */}
          <div
            className={`flex items-center justify-between p-3 rounded-lg ${
              shippingCharge === 0
                ? "bg-green-50 dark:bg-green-500/10"
                : "bg-purple-50 dark:bg-purple-500/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  shippingCharge === 0
                    ? "bg-green-100 dark:bg-green-500/20"
                    : "bg-purple-100 dark:bg-purple-500/20"
                }`}
              >
                <IndianRupee
                  className={`w-5 h-5 ${
                    shippingCharge === 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-purple-600 dark:text-purple-400"
                  }`}
                />
              </div>
              <span className="text-muted-foreground">Shipping</span>
            </div>
            <span
              className={`font-semibold ${
                shippingCharge === 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-foreground"
              }`}
            >
              {shippingCharge === 0 ? "FREE" : formatPrice(shippingCharge)}
            </span>
          </div>

          {/* Total Amount Card (Highlighted) */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-xl border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center">
                  <IndianRupee className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Total Amount
                  </p>
                  <p className="font-bold text-foreground text-2xl">
                    {formatPrice(amount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Breakdown */}
            <div className="pt-3 border-t border-blue-200 dark:border-blue-800">
              <button 
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="flex items-center justify-between w-full cursor-pointer text-sm text-primary"
              >
                <span>View breakdown</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showBreakdown ? "rotate-180" : ""}`} />
              </button>
              
              {showBreakdown && (
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Coupon Discount:</span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping:</span>
                    <span className={shippingCharge === 0 ? "text-green-600 dark:text-green-400" : ""}>
                      {shippingCharge === 0 ? "FREE" : formatPrice(shippingCharge)}
                    </span>
                  </div>
                  
                  {taxAmount > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax:</span>
                      <span>{formatPrice(taxAmount)}</span>
                    </div>
                  )}
                  
                  <div className="h-px bg-border my-2"></div>
                  <div className="flex justify-between font-semibold text-foreground">
                    <span>Total:</span>
                    <span>{formatPrice(amount)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop: Grid Table View */}
        <div className="hidden sm:block">
          {/* Table Header */}
          <div className="grid grid-cols-1 md:grid-cols-12 p-4 md:p-5 border-b border-border">
            <div className="md:col-span-3 font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Order Date
            </div>
            <div className="md:col-span-3 font-medium text-muted-foreground flex items-center gap-2">
              {getStatusIcon()}
              Status
            </div>
            <div className="md:col-span-3 font-medium text-muted-foreground flex items-center gap-2">
              <IndianRupee className="w-4 h-4" />
              Shipping
            </div>
            <div className="md:col-span-3 font-medium text-muted-foreground flex items-center gap-2">
              <IndianRupee className="w-4 h-4" />
              Total Amount
            </div>
          </div>

          {/* Table Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 p-4 md:p-5">
            <div className="md:col-span-3 font-semibold text-foreground flex items-center gap-2 py-2">
              <Calendar className="w-5 h-5 text-blue-500 md:hidden" />
              {formatDate(createdAt)}
            </div>
            <div className="md:col-span-3 py-2">
              <StatusDisplay status={status} />
            </div>
            <div
              className={`md:col-span-3 py-2 flex items-center gap-2 ${
                shippingCharge === 0 ? "text-green-600 dark:text-green-400" : "text-foreground"
              }`}
            >
              <IndianRupee className="w-5 h-5 text-purple-500 md:hidden" />
              {shippingCharge === 0 ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400">
                  FREE
                </span>
              ) : (
                <span className="font-semibold">
                  {formatPrice(shippingCharge)}
                </span>
              )}
            </div>
            <div className="md:col-span-3 py-2">
              <div className="flex items-center gap-3">
                <div className="md:hidden w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-bold text-xl text-foreground">
                    {formatPrice(amount)}
                  </div>
                  <p className="text-xs text-muted-foreground/70 md:hidden">
                    Total with delivery
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Section */}
          <div className="p-4 md:p-5 bg-muted/50 border-t border-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Breakdown:</span>
                <span className="ml-2 hidden md:inline">
                  Subtotal: {formatPrice(subtotal)}
                  {couponDiscount > 0 && ` - Coupon: ${formatPrice(couponDiscount)}`}
                  {shippingCharge > 0 ? ` + Shipping: ${formatPrice(shippingCharge)}` : " + Free Shipping"}
                  {taxAmount > 0 && ` + Tax: ${formatPrice(taxAmount)}`}
                  = <span className="font-semibold text-foreground">
                    Total: {formatPrice(amount)}
                  </span>
                </span>
              </div>

              {/* Desktop Breakdown Details */}
              <div className="hidden md:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-muted-foreground">
                    Subtotal: {formatPrice(subtotal)}
                  </span>
                </div>
                
                {couponDiscount > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 dark:text-green-400">
                      Coupon: -{formatPrice(couponDiscount)}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${shippingCharge === 0 ? "bg-green-500" : "bg-purple-500"}`}></div>
                  <span className={shippingCharge === 0 ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                    Shipping: {shippingCharge === 0 ? "FREE" : formatPrice(shippingCharge)}
                  </span>
                </div>
              </div>

              {/* Mobile Breakdown Button */}
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="md:hidden flex items-center gap-2 text-primary text-sm font-medium"
              >
                {showBreakdown ? "Hide" : "Show"} detailed breakdown
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showBreakdown ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {/* Mobile Expanded Breakdown */}
            {showBreakdown && (
              <div className="md:hidden mt-4 pt-4 border-t border-border">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-card rounded-lg">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
                  </div>
                  
                  {couponDiscount > 0 && (
                    <div className="flex justify-between items-center p-3 bg-card rounded-lg">
                      <span className="text-muted-foreground">Coupon Discount</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center p-3 bg-card rounded-lg">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={`font-semibold ${shippingCharge === 0 ? "text-green-600 dark:text-green-400" : "text-foreground"}`}>
                      {shippingCharge === 0 ? "FREE" : formatPrice(shippingCharge)}
                    </span>
                  </div>
                  
                  {taxAmount > 0 && (
                    <div className="flex justify-between items-center p-3 bg-card rounded-lg">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-semibold text-foreground">{formatPrice(taxAmount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-lg">
                    <span className="font-bold text-foreground">
                      Total Amount
                    </span>
                    <span className="font-bold text-xl text-foreground">
                      {formatPrice(amount)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;