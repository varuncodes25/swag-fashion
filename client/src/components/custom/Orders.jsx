import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import useErrorLogout from "@/hooks/use-error-logout";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatDate, getStatusColor } from "@/utils/orderHelpers";
import ShippingActions from "../Admin/ShippingActions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

const getPaymentStatusColor = (status) => {
  switch (status) {
    case "PAID":
      return "text-green-600 dark:text-green-400";
    case "PENDING":
      return "text-yellow-600 dark:text-yellow-400";
    case "FAILED":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
};

const formatShortDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  });
  const [loading, setLoading] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { handleErrorLogout } = useErrorLogout();
  const { toast } = useToast();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  /* ================= FETCH ORDERS ================= */
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: pagination.page,
          limit: pagination.limit
        });

        if (statusFilter) params.append('status', statusFilter);
        if (debouncedSearch) params.append('search', debouncedSearch);

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/get-all-orders?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setOrders(res.data.data);
        setPagination(res.data.pagination);
      } catch (error) {
        handleErrorLogout(error, error.response?.data?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [pagination.page, statusFilter, debouncedSearch]);

  /* ================= UPDATE ORDER STATUS ================= */
  const updateOrderStatus = async (newStatus, orderId) => {
    if (!window.confirm(`Change order status to "${newStatus}"?`)) {
      return;
    }

    let reason = "";
    if (newStatus === "CANCELLED") {
      reason = window.prompt("Please enter cancellation reason:");
      if (reason === null) return;
      if (!reason?.trim()) {
        toast({
          title: "Error",
          description: "Cancellation reason is required",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/update-order-status/${orderId}`,
        {
          status: newStatus,
          ...(reason && { reason }),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.success) {
        // Update local state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: newStatus,
                  ...(reason && { cancelReason: reason }),
                  dates: {
                    ...order.dates,
                    ...(newStatus === "CANCELLED" && { cancelled: new Date() }),
                    ...(newStatus === "DELIVERED" && { delivered: new Date() })
                  }
                }
              : order
          )
        );

        toast({
          title: "Success",
          description: `Order status updated to ${newStatus}`,
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= TOGGLE STATUS HISTORY ================= */
  const toggleStatusHistory = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  /* ================= CLEAR FILTERS ================= */
  const clearFilters = () => {
    setStatusFilter("");
    setSearchQuery("");
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 px-3">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Orders Management
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total: {pagination.total} orders
          {loading && <span className="ml-2 animate-pulse">• Loading...</span>}
        </div>
      </div>

      {/* FILTERS */}
      <div className="mb-6 px-3 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Search by order #, phone, name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-gray-800">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="SHIPPED">Shipped</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {(statusFilter || searchQuery) && (
            <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* ORDERS LIST */}
      <div className="flex flex-col gap-6 max-w-7xl mx-auto px-2">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-gray-500 dark:text-gray-400 text-xl">
              {loading ? "Loading orders..." : "No orders found"}
            </h2>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              loading={loading}
              expandedOrders={expandedOrders}
              toggleStatusHistory={toggleStatusHistory}
              updateOrderStatus={updateOrderStatus}
            />
          ))
        )}

        {/* PAGINATION */}
        {pagination.pages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    className={
                      pagination.page === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, pagination.pages) }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={pagination.page === pageNum}
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {pagination.pages > 5 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        isActive={pagination.page === pagination.pages}
                        onClick={() => setPagination(prev => ({ ...prev, page: pagination.pages }))}
                      >
                        {pagination.pages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                    className={
                      pagination.page === pagination.pages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
              Page {pagination.page} of {pagination.pages} • {orders.length} orders
            </div>
          </div>
        )}
      </div>
    </>
  );
};

/* ================= ORDER CARD COMPONENT ================= */
const OrderCard = ({ order, loading, expandedOrders, toggleStatusHistory, updateOrderStatus }) => {
  return (
    <Card className="p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-900">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Order ID</p>
          <p className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
            #{order.orderNumber || order.id?.slice(-8)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(order.orderDate)}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <OrderAmount amount={order.summary.total} />
          <OrderStatusSelector
            order={order}
            loading={loading}
            updateOrderStatus={updateOrderStatus}
          />
        </div>
      </div>

      {/* SHIPPING ACTIONS */}
      <ShippingActions order={order} />

      {/* CANCELLATION REASON */}
      {order.cancelReason && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-md">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">
            Cancellation Reason:
          </p>
          <p className="text-sm text-red-600 dark:text-red-400">
            {order.cancelReason}
          </p>
        </div>
      )}

      {/* ITEMS PREVIEW */}
      <div>
        <p className="font-medium mb-3 text-gray-900 dark:text-white">
          Products ({order.summary.totalItems})
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {order.itemsPreview?.map((item, index) => (
            <ProductCard key={index} product={item} />
          ))}
        </div>
      </div>

      <hr className="border-gray-200 dark:border-gray-800" />

      {/* INFO GRID */}
      <div className="grid md:grid-cols-3 gap-6">
        <CustomerInfo order={order} />
        <ShippingAddress order={order} />
        <PaymentInfo order={order} />
      </div>
    </Card>
  );
};

/* ================= PRODUCT CARD ================= */
const ProductCard = ({ product }) => (
  <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-3 bg-gray-50/50 dark:bg-gray-800/50">
    <div className="flex items-start gap-3">
      <img
        src={product.image}
        alt={product.name}
        className="w-16 h-16 object-cover rounded"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/64?text=No+Image";
        }}
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm line-clamp-2 text-gray-900 dark:text-white">
          {product.name}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Qty: {product.quantity}
        </p>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          ₹{product.price}
        </p>
        {product.color && product.color !== "Default" && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Color: {product.color} {product.size && `| Size: ${product.size}`}
          </p>
        )}
      </div>
    </div>
  </div>
);

/* ================= CUSTOMER INFO ================= */
const CustomerInfo = ({ order }) => (
  <div className="space-y-2">
    <p className="font-semibold text-sm text-gray-900 dark:text-white">
      Customer Details
    </p>
    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
      <p className="font-medium text-gray-900 dark:text-white">
        {order.customer?.name || 'N/A'}
      </p>
      {order.customer?.phone && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          📞 {order.customer.phone}
        </p>
      )}
      {order.customer?.email && (
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          ✉️ {order.customer.email}
        </p>
      )}
    </div>
  </div>
);

/* ================= SHIPPING ADDRESS ================= */
const ShippingAddress = ({ order }) => (
  <div className="space-y-2">
    <p className="font-semibold text-sm text-gray-900 dark:text-white">
      Shipping Address
    </p>
    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
      <p className="font-medium text-gray-900 dark:text-white">
        {order.shipping?.name || order.customer?.name || 'N/A'}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {order.shipping?.city}, {order.shipping?.pincode}
      </p>
      {order.shipping?.awb && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          📦 AWB: {order.shipping.awb}
        </p>
      )}
    </div>
  </div>
);

/* ================= PAYMENT INFO ================= */
const PaymentInfo = ({ order }) => (
  <div className="space-y-2">
    <p className="font-semibold text-sm text-gray-900 dark:text-white">
      Payment Details
    </p>
    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Method:
        </span>
        <span className="font-medium capitalize text-gray-900 dark:text-white">
          {order.payment?.method || 'N/A'}
        </span>
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Status:
        </span>
        <span
          className={`font-medium ${getPaymentStatusColor(order.payment?.status)}`}
        >
          {order.payment?.status || 'N/A'}
        </span>
      </div>
      {order.payment?.razorpayId && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            ID: {order.payment.razorpayId}
          </p>
        </div>
      )}
    </div>
  </div>
);

/* ================= ORDER STATUS SELECTOR ================= */
const OrderStatusSelector = ({ order, loading, updateOrderStatus }) => {
  const statusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "SHIPPED", label: "Shipped" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <div className="flex items-center gap-2">
      {/* Status Badge */}
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
          order.status
        )}`}
      >
        {order.status}
      </span>

      {/* Status Selector */}
      <Select
        value={order.status}
        onValueChange={(value) => updateOrderStatus(value, order.id)}
        disabled={loading}
      >
        <SelectTrigger className="w-[150px] capitalize bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="capitalize"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

/* ================= ORDER AMOUNT ================= */
const OrderAmount = ({ amount }) => (
  <div className="text-right">
    <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
    <p className="text-lg font-bold text-gray-900 dark:text-white">
      ₹{amount?.toLocaleString() || 0}
    </p>
  </div>
);

export default Orders;