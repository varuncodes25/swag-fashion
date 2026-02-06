import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useErrorLogout from "@/hooks/use-error-logout";
import axios from "axios";
import { ChevronRight } from "lucide-react";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const { handleErrorLogout } = useErrorLogout();
  const navigate = useNavigate();

  // Fetch orders
  useEffect(() => {
    const getMyOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/get-orders-by-user-id`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const normalizedOrders = (res.data.data || []).map((order) => ({
          id: order.id || order._id,
          orderNumber: order.orderNumber,
          date: order.date || order.createdAt,
          status: order.status || "PENDING",
          amount: order.pricing?.totalAmount || order.totalAmount || 0,
          items: order.items || [],
        }));

        setOrders(normalizedOrders);
      } catch (error) {
        console.error("MyOrders error:", error);
        handleErrorLogout(error);
      } finally {
        setLoading(false);
      }
    };

    getMyOrders();
  }, []);

  // Filter logic
  useEffect(() => {
    if (activeFilter === "ALL") {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(
        (order) => order.status?.toUpperCase() === activeFilter
      );
      setFilteredOrders(filtered);
    }
  }, [activeFilter, orders]);

  const statusFilters = [
    { id: "ALL", label: "All" },
    { id: "PENDING", label: "Pending" },
    { id: "CONFIRMED", label: "Confirmed" },
    { id: "SHIPPED", label: "Shipped" },
    { id: "DELIVERED", label: "Delivered" },
    { id: "CANCELLED", label: "Cancelled" },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="mb-6">
          <div className="h-6 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
              <div className="flex justify-between mb-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-5 bg-gray-200 rounded w-40 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
        <p className="text-sm text-gray-600 mt-1">
          {orders.length} orders total
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b">
        <div className="flex overflow-x-auto px-4 py-3 gap-2">
          {statusFilters.map((filter) => {
            const count = filter.id === "ALL" 
              ? orders.length 
              : orders.filter(o => o.status?.toUpperCase() === filter.id).length;
            
            const isActive = activeFilter === filter.id;
            
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {filter.label}
                {count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                    isActive 
                      ? "bg-white/30" 
                      : "bg-gray-200"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      <div className="p-4">
  {filteredOrders.length === 0 ? (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No orders found
      </h3>
      <p className="text-gray-600 mb-6">
        {activeFilter === "ALL" 
          ? "You haven't placed any orders yet." 
          : `You don't have any ${activeFilter.toLowerCase()} orders.`}
      </p>
      <button
        onClick={() => activeFilter !== "ALL" && setActiveFilter("ALL")}
        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg"
      >
        {activeFilter === "ALL" ? "Start Shopping" : "View All Orders"}
      </button>
    </div>
  ) : (
    <div className="space-y-3">
      {filteredOrders.map((order) => (
        <div 
          key={order.id} 
          className="bg-white rounded-lg border p-4"
          onClick={() => navigate(`/orders/${order.id}`)}
        >
          {/* Single Row Layout */}
          <div className="flex items-center gap-3">
            {/* Product Images on Left */}
            <div className="flex-shrink-0">
              {order.items && order.items.length > 0 && (
                <div className="relative">
                  <div className="w-16 h-16 rounded border bg-gray-100 overflow-hidden">
                    <img
                      src={order.items[0]?.image || "/placeholder.png"}
                      alt={order.items[0]?.name || "Product"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {order.items.length > 1 && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                      +{order.items.length - 1}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Middle: Order Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(order.date)}
                </span>
              </div>
              
              <h3 className="font-semibold text-gray-900 truncate">
                Order #{order.orderNumber}
              </h3>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{order.items?.length || 0} items</span>
                <span className="text-gray-400">•</span>
                <span>{order.payment?.method || "COD"}</span>
              </div>
            </div>

            {/* Right: Price & Arrow */}
            <div className="flex-shrink-0 text-right">
              <p className="font-bold text-gray-900">
                {formatPrice(order.amount)}
              </p>
              <div className="flex items-center justify-end text-blue-600 text-sm mt-1">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
    </div>
  );
};

export default MyOrders;