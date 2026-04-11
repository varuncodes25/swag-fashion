import { useState } from "react";
import axios from "axios";
import { Package, Truck, CheckCircle, Clock, CreditCard, Banknote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ShippingActions = ({ order, fetchOrders }) => {
  console.log(order, "Order received");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const createShipment = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/orders/${order.id}/create-shipment`,
        {},
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          } 
        }
      );
      
      console.log("Shipment response:", response.data);
      
      toast({
        title: "✅ Shipment Created",
        description: "Shipment will be processed automatically.",
        variant: "default",
      });
      
      if (fetchOrders) {
        setTimeout(() => {
          fetchOrders();
        }, 2000);
      }
    } catch (err) {
      console.error("Shipment creation error:", err);
      
      const errorMsg = err.response?.data?.message || 
                       err.response?.data?.error ||
                       err.message ||
                       "Please try again later";
      
      toast({
        title: "❌ Failed to create shipment",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Get payment info
  const paymentStatus = order.paymentStatus || "PENDING";
  const paymentMethod = order.paymentMethod || "UNKNOWN";
  const isPaid = paymentStatus === "PAID";
  const isCOD = paymentMethod === "COD";

  // ✅ Shipping data from backend
  const shipping = order.shipping || {};
  const shippingStatus = shipping.shipStatus || "PENDING";
  const hasAWB = shipping.awb && shipping.awb !== null;
  
  const shipment = order.shipment || {};
  const hasShipmentData = Object.keys(shipment).length > 0;

  // Get status info based on actual data
  const getStatusInfo = () => {
    // ✅ Case 1: AWB is generated (shipment exists)
    if (hasAWB) {
      if (shippingStatus === "COURIER_ASSIGNED") {
        return {
          icon: <Truck className="h-5 w-5 text-green-600" />,
          label: "Courier Assigned",
          color: "bg-green-100 text-green-800",
          description: `AWB: ${shipping.awb} | Courier assigned for delivery`,
          showButton: false
        };
      } 
      else if (shippingStatus === "CONFIRMED" || shippingStatus === "CREATED") {
        return {
          icon: <Package className="h-5 w-5 text-blue-600" />,
          label: "Shipment Created",
          color: "bg-blue-100 text-blue-800",
          description: `AWB: ${shipping.awb} | Processing courier assignment`,
          showButton: false
        };
      }
      else if (shippingStatus === "DELIVERED") {
        return {
          icon: <CheckCircle className="h-5 w-5 text-purple-600" />,
          label: "Delivered",
          color: "bg-purple-100 text-purple-800",
          description: "Package delivered successfully",
          showButton: false
        };
      }
    }
    
    // ✅ Case 2: No AWB, check if shipment object exists
    if (hasShipmentData && !hasAWB) {
      return {
        icon: <Package className="h-5 w-5 text-yellow-600" />,
        label: "Shipment Pending",
        color: "bg-yellow-100 text-yellow-800",
        description: "Shipment created but AWB pending",
        showButton: false
      };
    }
    
    // ✅ Case 3: No shipment at all - Show create button
    return {
      icon: <Package className="h-5 w-5" />,
      label: "Ready to Ship",
      color: "bg-gray-100 text-gray-800",
      description: "Create shipment to start shipping process",
      showButton: true
    };
  };

  const statusInfo = getStatusInfo();

  // ✅ Get payment badge styles
  const getPaymentBadge = () => {
    if (isPaid) {
      return {
        icon: <CreditCard className="h-3 w-3" />,
        label: "Paid",
        color: "bg-green-100 text-green-800"
      };
    } else if (isCOD) {
      return {
        icon: <Banknote className="h-3 w-3" />,
        label: "COD - Pending",
        color: "bg-orange-100 text-orange-800"
      };
    } else {
      return {
        icon: <Clock className="h-3 w-3" />,
        label: "Payment Pending",
        color: "bg-red-100 text-red-800"
      };
    }
  };

  const paymentBadge = getPaymentBadge();

  return (
    <div className="border rounded-lg p-4 bg-white">
      {/* Payment Status Badge - Top Right */}
      <div className="flex justify-end mb-2">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${paymentBadge.color}`}>
          {paymentBadge.icon}
          {paymentBadge.label}
        </span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`p-2 rounded-lg ${statusInfo.color}`}>
            {statusInfo.icon}
          </span>
          <div>
            <h3 className="font-medium text-gray-900">Shipping Status</h3>
            <p className={`text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </p>
          </div>
        </div>
        
        {/* Show AWB if available */}
        {hasAWB && (
          <span className="text-xs text-gray-500 font-mono">
            AWB: {shipping.awb}
          </span>
        )}
        
        {/* Show Shiprocket Order ID if available */}
        {shipment.shiprocketOrderId && (
          <span className="text-xs text-gray-500">
            ID: {shipment.shiprocketOrderId}
          </span>
        )}
      </div>

      {/* COD Warning Message */}
      {isCOD && !isPaid && (
        <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-xs text-orange-700 flex items-center gap-1">
            <Banknote className="h-3 w-3" />
            Cash on Delivery - Collect ₹{order.summary?.total || order.totalAmount} from customer
          </p>
        </div>
      )}

      {/* Paid Success Message */}
      {isPaid && (
        <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-700 flex items-center gap-1">
            <CreditCard className="h-3 w-3" />
            Payment already received - Ready to ship
          </p>
        </div>
      )}

      <p className="text-sm text-gray-600 mb-4">
        {statusInfo.description}
      </p>

      {/* Show Create Shipment button only when no shipment exists AND order is paid OR COD orders can also be shipped */}
      {!hasAWB && !hasShipmentData && statusInfo.showButton && (
        <button
          onClick={createShipment}
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Package className="h-4 w-4" />
              Create Shipment
            </>
          )}
        </button>
      )}

      {/* Show tracking info if AWB exists */}
      {hasAWB && (
        <div className="mt-3 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">AWB Number:</span>
            <span className="font-mono font-medium">{shipping.awb}</span>
          </div>
          
          {shipping.city && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery City:</span>
              <span>{shipping.city}</span>
            </div>
          )}
          
          {shipping.pincode && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pincode:</span>
              <span>{shipping.pincode}</span>
            </div>
          )}
          
          {/* COD Collection Reminder */}
          {isCOD && !isPaid && shippingStatus !== "DELIVERED" && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-700 font-medium">
                ⚠️ COD Order - Collect ₹{order.summary?.total || order.totalAmount} before delivery
              </p>
            </div>
          )}
          
          {/* Real Tracking Link */}
          {shipping.awb && !shipping.awb.startsWith('MOCK') && (
            <a
              href={`https://shiprocket.co/tracking/${shipping.awb}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <Truck className="h-4 w-4" />
              Track Shipment
            </a>
          )}
          
          {/* Mock Mode Indicator */}
          {shipping.awb && shipping.awb.startsWith('MOCK') && (
            <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded text-center">
              ⚠️ Testing Mode - Mock AWB
            </div>
          )}
        </div>
      )}

      {/* Additional info */}
      <div className="mt-4 text-sm">
        {shipment.invoiceUrl && (
          <a
            href={shipment.invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-between items-center hover:text-primary transition-colors"
          >
            <span className="text-gray-600">Invoice:</span>
            <span className="font-medium text-primary">Download PDF</span>
          </a>
        )}
        
        {shipment.courier && (
          <div className="flex justify-between mt-1">
            <span className="text-gray-600">Courier:</span>
            <span className="font-medium">{shipment.courier}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingActions;