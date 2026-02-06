// src/utils/orderUtils.js

import { Calendar } from "lucide-react";

// Format price
export const formatPrice = (price) => {
  if (!price && price !== 0) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(price);
};

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return "Date not available";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Invalid date";
  }
};

// Get status color
export const getStatusColor = (status) => {
  const statusUpper = (status || "").toUpperCase();
  
  if (statusUpper.includes("DELIVERED")) {
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
  }
  if (statusUpper.includes("CANCELLED")) {
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  }
  if (statusUpper.includes("SHIPPED")) {
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
  }
  if (statusUpper.includes("CONFIRMED")) {
    return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
  }
  return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
};

// Get status icon component
export const getStatusIcon = (status) => {
  const statusUpper = (status || "").toUpperCase();
  
  if (statusUpper.includes("DELIVERED")) {
    return <Package className="w-4 h-4" />;
  }
  if (statusUpper.includes("CANCELLED")) {
    return <span className="w-4 h-4 flex items-center justify-center">✕</span>;
  }
  if (statusUpper.includes("SHIPPED")) {
    return <Truck className="w-4 h-4" />;
  }
  return <Calendar className="w-4 h-4" />;
};

// Get status display component
export const StatusDisplay = ({ status }) => {
  const statusText = status.charAt(0) + status.slice(1).toLowerCase();
  const statusClass = getStatusColor(status);
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}>
      {getStatusIcon(status)}
      {statusText}
    </span>
  );
};