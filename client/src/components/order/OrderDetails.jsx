// src/pages/OrderDetails.jsx
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Package } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";  // ✅ Import
import { fetchOrderDetails } from "@/redux/slices/order";  // ✅ Import thunk
import OrderData from "../../components/custom/OrderData";
import { formatPrice, formatDate, StatusDisplay } from "../../utils/orderHelpers";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // ============ ✅ REDUX STATE - DIRECT LO! ============
  const { 
    currentOrder: order, 
    loading, 
    error 
  } = useSelector((state) => state.order);

  // ============ ✅ FETCH ORDER DETAILS ============
  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderDetails(orderId));
    }
  }, [dispatch, orderId]);

  // ============ ✅ CANCEL SUCCESS HANDLER ============
  const handleCancelSuccess = () => {
    // Order details refresh karo
    dispatch(fetchOrderDetails(orderId));
  };

  // ============ LOADING STATE ============
  if (loading && !order) {
    return <LoadingSkeleton />;
  }

  // ============ ERROR STATE ============
  if (error || !order) {
    return <ErrorPage error={error} navigate={navigate} />;
  }

  // Extract order data
  const orderNumber = order.orderNumber || `#${order._id?.slice(-8)?.toUpperCase() || "N/A"}`;
  const orderDate = order.date || order.createdAt || new Date().toISOString();
  const orderStatus = order.status || "PENDING";
  const orderAmount = order.pricing?.totalAmount || order.totalAmount || order.amount || 0;
  const orderSubtotal = order.pricing?.subtotal || order.subtotal || 0;
  const shippingCharge = order.pricing?.shippingCharge || order.shippingCharge || 0;
  const orderItems = order.items || order.products || [];
  const address = order.shipping?.address || order.shippingAddress || {};
  const paymentMethod = order.payment?.method || order.paymentMethod || "COD";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with Back Navigation */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate("/orders")}
                className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Orders
              </button>
              <button
                onClick={() => navigate("/")}
                className="ml-auto flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Home className="w-5 h-5" />
                Home
              </button>
            </div>

            {/* Simple Order Header */}
            <div className="bg-card rounded-xl p-5 border border-border mb-6 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground mb-2">
                    Order #{orderNumber}
                  </h1>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(orderDate)}
                    </span>
                    <StatusDisplay status={orderStatus} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">
                    {formatPrice(orderAmount)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {orderItems.length} {orderItems.length === 1 ? "item" : "items"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Order Content - OrderData component */}
          <OrderData
            id={order._id || order.id}
            orderNumber={orderNumber}
            date={orderDate}
            status={orderStatus}
            items={orderItems}
            pricing={{
              subtotal: orderSubtotal,
              shippingCharge: shippingCharge,
              couponDiscount: order.pricing?.couponDiscount || order.discount || 0,
              taxAmount: order.pricing?.taxAmount || order.taxAmount || 0,
              totalAmount: orderAmount
            }}
            shipping={{ address: address }}
            summary={{
              itemCount: orderItems.length,
              totalQuantity: orderItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
            }}
            onCancelSuccess={handleCancelSuccess}  // ✅ Cancel ke baad refresh
          />

          {/* Additional Info Card */}
          <div className="mt-8 bg-card rounded-xl p-6 border border-border transition-colors">
            <h3 className="font-semibold text-foreground mb-4 text-lg">
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div>
                <h4 className="font-medium text-foreground/80 mb-2">
                  Shipping Address
                </h4>
                {address && address.name ? (
                  <div className="text-muted-foreground text-sm space-y-1">
                    <p>{address.name}</p>
                    <p>{address.addressLine1 || address.street}</p>
                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                    <p>{address.city}, {address.state} {address.pincode}</p>
                    <p className="mt-2">📞 {address.phone || "Not available"}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground/70 text-sm">
                    Address information not available
                  </p>
                )}
              </div>

              {/* Payment Info */}
              <div>
                <h4 className="font-medium text-foreground/80 mb-2">
                  Payment Information
                </h4>
                <div className="text-muted-foreground text-sm space-y-2">
                  <div>
                    <p className="font-medium text-foreground/90">{paymentMethod}</p>
                    <p className="text-muted-foreground/70">Payment Method</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => navigate("/orders")}
              className="px-6 py-3 border border-border text-muted-foreground rounded-lg hover:bg-muted hover:text-foreground font-medium transition-colors"
            >
              Back to Orders
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
            >
              Print Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton (same as before)
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="h-8 w-32 bg-muted rounded animate-pulse mb-6"></div>
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="h-6 w-48 bg-muted rounded animate-pulse mb-4"></div>
            <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Error Page (same as before)
const ErrorPage = ({ error, navigate }) => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center max-w-md p-8">
      <div className="w-20 h-20 mx-auto mb-6 bg-destructive/10 rounded-full flex items-center justify-center">
        <Package className="w-10 h-10 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-3">
        Order Not Found
      </h2>
      <p className="text-muted-foreground mb-6">
        {error || "The order you're looking for doesn't exist."}
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => navigate("/orders")}
          className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-lg transition-colors shadow-sm"
        >
          Back to Orders
        </button>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 border border-border text-muted-foreground hover:bg-muted hover:text-foreground font-medium rounded-lg transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  </div>
);

export default OrderDetails;