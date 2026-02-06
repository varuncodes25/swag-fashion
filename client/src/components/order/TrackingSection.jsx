// src/components/custom/OrderData/TrackingSection.jsx
import React from "react";
import { Truck, CheckCircle, Clock, XCircle, MapPin } from "lucide-react";

const TrackingStep = ({ step, isLast, isActive }) => {
  // Get icon based on status
  const getStatusIcon = (status) => {
    const statusLower = (status || "").toLowerCase();
    
    if (statusLower.includes("delivered")) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (statusLower.includes("cancelled") || statusLower.includes("returned")) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    if (statusLower.includes("shipped") || statusLower.includes("transit")) {
      return <Truck className="w-5 h-5 text-blue-500" />;
    }
    return <Clock className="w-5 h-5 text-yellow-500" />;
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div className="relative pl-8 pb-8 last:pb-0">
      {/* Timeline line */}
      {!isLast && (
        <div className={`absolute left-[15px] top-[20px] h-full w-0.5 ${isActive ? "bg-blue-200" : "bg-gray-200"}`}></div>
      )}
      
      {/* Icon */}
      <div className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center z-10 ${isActive ? "bg-blue-100 ring-4 ring-blue-50" : "bg-gray-100"}`}>
        {getStatusIcon(step.status)}
      </div>
      
      {/* Content */}
      <div className={`p-4 rounded-lg ${isActive ? "bg-blue-50 border border-blue-100" : "bg-gray-50"}`}>
        <div className="flex justify-between items-start">
          <div>
            <h4 className={`font-semibold ${isActive ? "text-blue-800" : "text-gray-800"}`}>
              {step.status || "Status Update"}
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              {formatDate(step.updated_at || step.timestamp || step.date)}
            </p>
          </div>
          {isActive && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Current
            </span>
          )}
        </div>
        
        {step.description && (
          <p className="mt-2 text-sm text-gray-600">{step.description}</p>
        )}
        
        {step.location && (
          <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            {step.location}
          </div>
        )}
      </div>
    </div>
  );
};

const TrackingHistory = ({ trackingData }) => {
  // Find current active step (usually the latest one)
  const getActiveStepIndex = () => {
    if (!trackingData.length) return -1;
    return trackingData.length - 1; // Last step is usually active
  };
  
  const activeStepIndex = getActiveStepIndex();

  return (
    <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
          <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
            Tracking History
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Latest updates on your order delivery
          </p>
        </div>
      </div>
      
      {trackingData.length > 0 ? (
        <div className="space-y-1">
          {trackingData.map((step, index) => (
            <TrackingStep 
              key={index}
              step={step}
              isLast={index === trackingData.length - 1}
              isActive={index === activeStepIndex}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
            No Tracking Available Yet
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tracking information will appear here once your order is shipped
          </p>
        </div>
      )}
    </div>
  );
};

const NoTrackingMessage = () => (
  <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
    <div className="text-center">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <Truck className="w-8 h-8 text-gray-400" />
      </div>
      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
        Tracking Not Available
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        This order hasn't been shipped yet. Tracking information will be available once the order is dispatched.
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm">
        <Clock className="w-4 h-4" />
        Expected in 3-5 business days
      </div>
    </div>
  </div>
);

const TrackingSection = ({ trackingData = [] }) => {
  const hasTrackingData = trackingData && trackingData.length > 0;
  
  return hasTrackingData ? (
    <TrackingHistory trackingData={trackingData} />
  ) : (
    <NoTrackingMessage />
  );
};

export default TrackingSection;