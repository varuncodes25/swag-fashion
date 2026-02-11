import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ShoppingBag, Package } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders } from "@/redux/slices/order";

const MyOrders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // ============ REDUX STATE ============
  const { 
    orders = [],
    loading 
  } = useSelector((state) => state.order);
  
  // ============ LOCAL STATE ============
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState("ALL");

  // ============ FETCH ORDERS ============
  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  // ============ FILTER LOGIC ============
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
      year: "numeric"
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
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "DELIVERED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // ============ LOADING STATE ============
  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="mb-6">
          <div className="h-6 bg-muted rounded w-32 mb-2 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-48 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-lg p-4 animate-pulse border border-border">
              <div className="flex justify-between mb-3">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-6 bg-muted rounded w-20"></div>
              </div>
              <div className="h-5 bg-muted rounded w-40 mb-3"></div>
              <div className="h-8 bg-muted rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <h1 className="text-xl font-bold text-foreground">My Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'} total
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="flex overflow-x-auto px-4 py-3 gap-2 scrollbar-hide">
          {statusFilters.map((filter) => {
            const count = filter.id === "ALL" 
              ? orders.length 
              : orders.filter(o => o.status?.toUpperCase() === filter.id).length;
            
            const isActive = activeFilter === filter.id;
            
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {filter.label}
                {count > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                    isActive 
                      ? "bg-white/30 text-primary-foreground" 
                      : "bg-muted-foreground/20 text-muted-foreground"
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
          <div className="text-center py-12 bg-card rounded-2xl border border-border">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No orders found</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              {activeFilter === "ALL" 
                ? "You haven't placed any orders yet. Start shopping!" 
                : `You don't have any ${activeFilter.toLowerCase()} orders.`}
            </p>
            <button
              onClick={() => activeFilter !== "ALL" ? setActiveFilter("ALL") : navigate("/")}
              className="px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-lg"
            >
              {activeFilter === "ALL" ? "Start Shopping" : "View All Orders"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div 
                key={order.id} 
                className="bg-card rounded-xl border border-border p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <div className="flex items-center gap-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    {order.items && order.items.length > 0 ? (
                      <div className="relative">
                        <div className="w-16 h-16 rounded-lg border border-border bg-muted overflow-hidden">
                          <img
                            src={order.items[0]?.image || "/placeholder.png"}
                            alt={order.items[0]?.name || "Product"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/64x64?text=No+Image";
                            }}
                          />
                        </div>
                        {order.items.length > 1 && (
                          <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-background">
                            +{order.items.length - 1}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg border border-border bg-muted flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Order Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(order.date)}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-foreground truncate mb-1">
                      Order #{order.orderNumber || order.id?.slice(-8)}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}</span>
                      <span className="text-border">•</span>
                      <span>{order.payment?.method || "COD"}</span>
                    </div>
                  </div>

                  {/* Price & Arrow */}
                  <div className="flex-shrink-0 text-right">
                    <p className="font-bold text-foreground text-lg">
                      {formatPrice(order.amount)}
                    </p>
                    <div className="flex items-center justify-end text-primary text-sm mt-1">
                      <span className="mr-1">View</span>
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