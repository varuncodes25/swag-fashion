// src/pages/OrderDetails.jsx (Simplified)
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Home } from "lucide-react";
import OrderData from "../../components/custom/OrderData";
import useErrorLogout from "@/hooks/use-error-logout";
import { formatPrice, formatDate, StatusDisplay } from "../../utils/orderHelpers";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { handleErrorLogout } = useErrorLogout();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        
        const orderData = res.data.data || res.data.order || res.data;
        setOrder(orderData);
      } catch (error) {
        console.error("OrderDetails error:", error);
        if (error.response?.status === 404) {
          setError("Order not found");
        } else if (error.response?.status === 401) {
          setError("Please login to view order details");
        } else {
          setError("Failed to load order details");
        }
        handleErrorLogout(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/cancel-order`,
        { orderId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Order cancelled successfully");
      navigate("/orders");
    } catch (error) {
      console.error(error);
      alert("Failed to cancel order");
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with Back Navigation */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate("/orders")}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Orders
              </button>
              <button
                onClick={() => navigate("/")}
                className="ml-auto flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                <Home className="w-5 h-5" />
                Home
              </button>
            </div>

            {/* Simple Order Header - Only essential info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Order #{orderNumber}
                  </h1>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(orderDate)}
                    </span>
                    <StatusDisplay status={orderStatus} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(orderAmount)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
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
            onCancel={handleCancelOrder}
          />

          {/* Additional Info in a Simple Card */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Shipping Address
                </h4>
                {address && address.name ? (
                  <div className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
                    <p>{address.name}</p>
                    <p>{address.addressLine1 || address.street}</p>
                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                    <p>{address.city}, {address.state} {address.pincode}</p>
                    <p className="mt-2">📞 {address.phone || "Not available"}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Address information not available
                  </p>
                )}
              </div>

              {/* Payment Info */}
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Information
                </h4>
                <div className="text-gray-600 dark:text-gray-400 text-sm space-y-2">
                  <div>
                    <p className="font-medium">{paymentMethod}</p>
                    <p className="text-gray-500">Payment Method</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => navigate("/orders")}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
            >
              Back to Orders
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Print Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Extract loading and error components
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6"></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ErrorPage = ({ error, navigate }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center max-w-md p-8">
      <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
        <Package className="w-10 h-10 text-red-600 dark:text-red-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        Order Not Found
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {error || "The order you're looking for doesn't exist."}
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => navigate("/orders")}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Back to Orders
        </button>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  </div>
);

export default OrderDetails;