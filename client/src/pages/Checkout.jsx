import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initCheckout, setProductId, setVariantId } from "@/redux/slices/checkoutSlice";
import AddressSection from "@/components/checkout/AddressSection";
import PaymentMethod from "@/components/checkout/PaymentMethod";
import PlaceOrderButton from "@/components/checkout/PlaceOrderButton";
import {
  ArrowLeft,
  ShoppingBag,
  Shield,
  MapPin,
  Package,
  CreditCard,
  CheckCircle,
  Truck,
  Tag,
  IndianRupee,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState("address");

  const {
    addressId,
    paymentMethod,
    items = [],
    addresses = [],
    summary,
  } = useSelector((s) => s.checkout);

  const subtotal = summary?.subtotal || 0;
  const discount = summary?.discount || 0;
  const shipping = summary?.shipping || 0;
  const tax = summary?.tax || 0;
  const total = summary?.total || 0;
  const selectedAddress = addresses.find((addr) => addr._id === addressId);

  // Load checkout data
  useEffect(() => {
    if (!addressId) return;

    const params = new URLSearchParams(window.location.search);
    const productId = params.get("productId");
    const variantId = params.get("variantId");
    const quantity = params.get("quantity") || 1;

    dispatch(setProductId(productId));
    dispatch(setVariantId(variantId));

    if (addressId) {
      const selectedAddress = addresses.find(addr => addr._id === addressId);
      dispatch(initCheckout({
        productId,
        variantId,
        quantity,
        addressId,
        address: selectedAddress
      }));
    } else {
      dispatch(initCheckout({
        addressId,
        address: selectedAddress,
        checkoutType: "CART"
      }));
    }
  }, [dispatch, addressId, addresses]);

  // Back button handler
  const handleBack = () => {
    if (currentStep === "summary") {
      setCurrentStep("address");
    } else if (currentStep === "payment") {
      setCurrentStep("summary");
    } else {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate("/");
      }
    }
  };

  // Meesho Style Steps
  const steps = [
    { id: "address", label: "Address", icon: MapPin, color: "blue" },
    { id: "summary", label: "Summary", icon: Package, color: "purple" },
    { id: "payment", label: "Payment", icon: CreditCard, color: "green" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Meesho Style */}
      <div className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-gray-700 hover:text-pink-600"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back</span>
            </button>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-pink-600" />
                <h1 className="text-lg font-bold text-gray-900">Checkout</h1>
              </div>
              <p className="text-xs text-gray-500 mt-1">100% Secure</p>
            </div>

            <div className="flex items-center gap-1 text-green-600">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-medium">Safe</span>
            </div>
          </div>

          {/* Progress Bar - Meesho Style */}
          <div className="mt-4">
            <div className="flex justify-between items-center relative">
              {steps.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = index < steps.findIndex(s => s.id === currentStep);
                const isPast = index <= steps.findIndex(s => s.id === currentStep);

                return (
                  <div key={step.id} className="flex flex-col items-center relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center
                      ${isCompleted ? 'bg-green-500' : 
                        isActive ? `bg-${step.color}-500` : 'bg-gray-300'}`}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <step.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                      )}
                    </div>
                    <span className={`text-xs mt-1 ${isPast ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
              
              {/* Progress Line */}
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 -z-10">
                <div className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${(steps.findIndex(s => s.id === currentStep) / (steps.length - 1)) * 100}%` }}>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pb-24">
        {/* Step 1: Address Selection - Meesho Style */}
        {currentStep === "address" && (
          <div className="pt-4">
            <div className="bg-white rounded-lg shadow-sm border mb-4">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">Select Delivery Address</h2>
                      <p className="text-sm text-gray-500">Choose where to deliver</p>
                    </div>
                  </div>
                  <button className="text-sm font-medium text-blue-600">
                    + Add New
                  </button>
                </div>
              </div>
              <div className="p-4">
                <AddressSection />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Order Summary - Meesho Style */}
        {currentStep === "summary" && (
          <div className="pt-4 space-y-3">
            {/* Address Card - Meesho Style */}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">Delivery Address</h3>
                      <p className="text-sm text-gray-500">Confirmed for delivery</p>
                    </div>
                    <button
                      onClick={() => setCurrentStep("address")}
                      className="text-sm font-medium text-pink-600 bg-pink-50 px-3 py-1 rounded-full"
                    >
                      Change
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 flex items-center justify-center">
                        <span className="text-gray-600">📍</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{selectedAddress?.name}</p>
                        <p className="text-sm text-gray-600 mt-1">{selectedAddress?.address_line1}</p>
                        <p className="text-sm text-gray-600">
                          {selectedAddress?.city}, {selectedAddress?.state} - {selectedAddress?.pincode}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-gray-600 flex items-center gap-1">
                            <span>📱</span>
                            {selectedAddress?.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Details Card - Meesho Style */}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Tag className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Price Details</h3>
                  <p className="text-sm text-gray-500">Breakdown of your order</p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Price Rows */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Total MRP</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">Discount</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        SAVED
                      </span>
                    </div>
                    <span className="font-medium text-green-600">-₹{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">Delivery Charges</span>
                  </div>
                  <span className={`font-medium ${shipping === 0 ? "text-green-600" : "text-gray-900"}`}>
                    {shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}
                  </span>
                </div>

                {tax > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-700">Taxes & Charges</span>
                    <span className="font-medium">₹{tax.toFixed(2)}</span>
                  </div>
                )}

                {/* Total Amount - Highlighted */}
                <div className="pt-3 mt-2 bg-gradient-to-r from-pink-50 to-red-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">Total Amount</p>
                      <p className="text-xs text-gray-500">(Inclusive of all taxes)</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-xl">₹{total.toFixed(2)}</p>
                      {discount > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          You save ₹{discount.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-xs">ℹ️</span>
                </div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Secure Transaction:</span> Your payment is protected with 256-bit SSL encryption.
                  By proceeding, you agree to our <span className="text-blue-600 font-medium">Terms & Conditions</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payment - Meesho Style */}
        {/* Step 3: Payment - Meesho Style */}
{currentStep === "payment" && (
  <div className="pt-4 space-y-4 pb-24"> {/* ✅ Bottom padding add की */}
    {/* Payment Header */}
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900">Select Payment Method</h2>
          <p className="text-sm text-gray-500">Choose how you want to pay</p>
        </div>
      </div>
      <PaymentMethod />
    </div>

    {/* Order Summary Card */}
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
          <Package className="w-5 h-5 text-pink-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Order Summary</h3>
          <p className="text-sm text-gray-500">Review your items</p>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
            <div className="relative">
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 object-cover rounded border"
              />
              {item.quantity > 1 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-600 text-white text-xs rounded-full flex items-center justify-center">
                  {item.quantity}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                {item.discountAmount > 0 && (
                  <span className="text-xs text-green-600">Save ₹{item.discountAmount.toFixed(2)}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">₹{(item.lineTotal || 0).toFixed(2)}</p>
              {item.discountAmount > 0 && (
                <p className="text-xs text-gray-400 line-through">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Final Total */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between items-center">
          <span className="font-bold text-gray-900">Total Amount</span>
          <div className="text-right">
            <p className="font-bold text-gray-900 text-xl">₹{total.toFixed(2)}</p>
            {discount > 0 && (
              <p className="text-xs text-green-600">You saved ₹{discount.toFixed(2)}</p>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Desktop Place Order Button */}
    <div className="hidden lg:block">
      <PlaceOrderButton />
    </div>
  </div>
)}

{/* Mobile Sticky Place Order Button - Payment Step के लिए */}
{currentStep === "payment" && (
  <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl p-4 z-50">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">Total Payable</p>
        <p className="font-bold text-gray-900 text-xl">₹{total.toFixed(2)}</p>
        <p className="text-xs text-gray-500">Inclusive of all taxes</p>
      </div>
      
      <div className="flex-1 max-w-[200px]">
        <PlaceOrderButton />
      </div>
    </div>
  </div>
)}
      </main>

      {/* Mobile Bottom Action Bar - Meesho Style */}
      {currentStep !== "payment" && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl p-4 z-50">
          <div className="flex items-center justify-between">
            <div>
              {currentStep === "summary" ? (
                <div>
                  <p className="text-sm text-gray-600">Total Payable</p>
                  <p className="font-bold text-gray-900 text-xl">₹{total.toFixed(2)}</p>
                </div>
              ) : currentStep === "address" ? (
                <div>
                  <p className="text-sm text-gray-600">Select Address to Continue</p>
                  <p className="text-xs text-gray-500">Choose delivery location</p>
                </div>
              ) : null}
            </div>

            <div>
              {currentStep === "address" && addressId ? (
                <button
                  onClick={() => setCurrentStep("summary")}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg active:scale-95 transition-transform"
                >
                  Continue
                </button>
              ) : currentStep === "summary" ? (
                <button
                  onClick={() => setCurrentStep("payment")}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold rounded-lg shadow-lg active:scale-95 transition-transform flex items-center gap-2"
                >
                  <span>Continue to Payment</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              ) : (
                <button
                  disabled
                  className="px-6 py-3 bg-gray-300 text-gray-500 font-semibold rounded-lg"
                >
                  Select Address
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;