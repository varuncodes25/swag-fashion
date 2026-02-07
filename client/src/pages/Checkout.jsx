import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initCheckout, setProductId ,setVariantId} from "@/redux/slices/checkoutSlice";
import AddressSection from "@/components/checkout/AddressSection";
import OrderSummary from "@/components/checkout/OrderSummary";
import PaymentMethod from "@/components/checkout/PaymentMethod";
import PlaceOrderButton from "@/components/checkout/PlaceOrderButton";
import {
  ArrowLeft,
  ShoppingBag,
  Shield,
  MapPin,
  Package,
  CreditCard,
  Truck,
  CheckCircle,
  Tag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileBottomBar from "@/components/checkout/MobileBottomBar";

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState("address");

  const {
    addressId,
    paymentMethod,
    items = [],
    addresses = [],
    summary, // ✅ summary data available ha
  } = useSelector((s) => s.checkout);
  // ✅ USE summary data instead
  const subtotal = summary?.subtotal || 0;
  const discount = summary?.discount || 0;
  const shipping = summary?.shipping || 0;
  const tax = summary?.tax || 0;
  const total = summary?.total || 0;
  const selectedAddress = addresses.find((addr) => addr._id === addressId);

  // Step flow
  // useEffect(() => {
  //   if (addressId && currentStep === "address") {
  //     setCurrentStep("summary");
  //   }
  // }, [addressId, currentStep]);

  // Load checkout data
  // CheckoutPage.jsx में useEffect update करें
// CheckoutPage.jsx - useEffect update karo
useEffect(() => {
  if (!addressId) return;
  
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("productId");
  const variantId = params.get("variantId"); // ✅ ADD THIS
  const quantity = params.get("quantity") || 1;
  
  console.log("📥 Checkout params:", {
    productId,
    variantId, // ✅ Check if variantId is coming
    quantity
  });
  
  dispatch(setProductId(productId));
  dispatch(setVariantId(variantId));
  // ✅ Pass variantId to initCheckout
  if (addressId) {
    const selectedAddress = addresses.find(addr => addr._id === addressId);
    dispatch(initCheckout({ 
      productId, 
      variantId, // ✅ ADD THIS
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
}, [dispatch, addressId, addresses]); // ✅ addresses dependency add की

  // Calculate total
  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
  };

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Checkout
              </h1>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="hidden sm:inline text-gray-600 dark:text-gray-400">
                100% Secure
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-8 mb-6">
          {[
            { id: "address", label: "Address", icon: MapPin },
            { id: "summary", label: "Summary", icon: Package },
            { id: "payment", label: "Payment", icon: CreditCard },
          ].map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted =
              (step.id === "address" && addressId) ||
              (step.id === "summary" && addressId);

            return (
              <div key={step.id} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${
                    isCompleted
                      ? "bg-blue-600 text-white"
                      : isActive
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-2 border-blue-500"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:inline ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>

                {index < 2 && (
                  <div
                    className={`w-12 h-0.5 ${
                      step.id === "address" && addressId
                        ? "bg-blue-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Steps Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Address Selection */}
            {currentStep === "address" && (
              <div className="animate-fadeIn">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 border dark:border-gray-700 overflow-hidden transition-colors">
                  
                  <div className="p-6">
                    <AddressSection />
                  </div>
                </div>

                {/* Desktop Continue Button (Only when address selected) */}
                {addressId && (
                  <div className="hidden lg:flex justify-end mt-6">
                    <button
                      onClick={() => setCurrentStep("summary")}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-3 group"
                    >
                      <span>Continue to Order Summary</span>
                      <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Order Summary */}
            {currentStep === "summary" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Address Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 border dark:border-gray-700 p-6 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">Delivery Address</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Confirmed for delivery</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentStep("address")}
                      className="px-4 py-2 text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-medium bg-pink-50 dark:bg-pink-900/20 rounded-lg transition-colors"
                    >
                      Change
                    </button>
                  </div>
                  
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-5 border dark:border-gray-700">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 dark:text-blue-400 text-lg">📍</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedAddress?.name}</p>
                        <p className="text-gray-700 dark:text-gray-300 mt-2">{selectedAddress?.address_line1}</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedAddress?.city}, {selectedAddress?.state} - {selectedAddress?.pincode}
                        </p>
                        <div className="flex items-center gap-6 mt-3">
                          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <span className="text-lg">📱</span>
                            {selectedAddress?.phone}
                          </span>
                          {selectedAddress?.email && (
                            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                              <span className="text-lg">✉️</span>
                              {selectedAddress.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Details Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 border dark:border-gray-700 p-6 transition-colors">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
                      <Tag className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">Price Details</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Breakdown of your order</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b dark:border-gray-700">
                      <span className="text-gray-700 dark:text-gray-300">Total MRP</span>
                      <span className="font-semibold text-gray-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between items-center py-3 border-b dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-700 dark:text-gray-300">Discount</span>
                          <span className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full font-medium">
                            SAVED
                          </span>
                        </div>
                        <span className="font-semibold text-green-600 dark:text-green-400">-₹{discount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center py-3 border-b dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">Delivery Charges</span>
                      </div>
                      <span className={`font-semibold ${shipping === 0 ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white"}`}>
                        {shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}
                      </span>
                    </div>

                    {tax > 0 && (
                      <div className="flex justify-between items-center py-3 border-b dark:border-gray-700">
                        <span className="text-gray-700 dark:text-gray-300">Taxes & Charges</span>
                        <span className="font-semibold text-gray-900 dark:text-white">₹{tax.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Total Amount */}
                    <div className="mt-6 pt-6 border-t dark:border-gray-700">
                      <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl p-5">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-lg">Total Amount</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">(Inclusive of all taxes)</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 dark:text-white text-2xl">₹{total.toFixed(2)}</p>
                            {discount > 0 && (
                              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                You save ₹{discount.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Continue Button */}
                <div className="hidden lg:flex justify-end">
                  <button
                    onClick={() => setCurrentStep("payment")}
                    className="px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-3 group"
                  >
                    <span>Continue to Payment</span>
                    <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === "payment" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Payment Method Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 border dark:border-gray-700 p-6 transition-colors">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900 dark:text-white text-xl">Payment Method</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Choose how you want to pay</p>
                    </div>
                  </div>
                  <PaymentMethod />
                </div>

                {/* Order Summary Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 border dark:border-gray-700 p-6 transition-colors">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">Order Summary</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Review your items</p>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                    {items.map((item) => (
                      <div key={item.productId} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                        <div className="relative">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600 group-hover:border-pink-500 dark:group-hover:border-pink-400 transition-colors"
                          />
                          {item.quantity > 1 && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-pink-600 to-rose-600 text-white text-xs rounded-full flex items-center justify-center shadow-lg">
                              {item.quantity}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</span>
                            {item.discountAmount > 0 && (
                              <span className="text-sm text-green-600 dark:text-green-400">Save ₹{item.discountAmount.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">₹{(item.lineTotal || 0).toFixed(2)}</p>
                          {item.discountAmount > 0 && (
                            <p className="text-sm text-gray-400 dark:text-gray-500 line-through">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 dark:text-white text-lg">Total Amount</span>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white text-2xl">₹{total.toFixed(2)}</p>
                        {discount > 0 && (
                          <p className="text-sm text-green-600 dark:text-green-400">You saved ₹{discount.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Place Order Button */}
                <div className="hidden lg:block">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-lg">Ready to Place Order?</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Review everything before confirming</p>
                      </div>
                      <div className="w-48">
                        <PlaceOrderButton />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary (Desktop Only) */}
          <div className="hidden lg:block">
            <div className="sticky top-32">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-gray-900/50 border dark:border-gray-700 p-6 transition-colors">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-6 pb-4 border-b dark:border-gray-700">Order Summary</h3>
                
                {/* Items Preview */}
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                  {items.slice(0, 3).map((item) => (
                    <div key={item.productId} className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg border dark:border-gray-600"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">₹{(item.lineTotal || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {items.length > 3 && (
                    <div className="text-center pt-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">+ {items.length - 3} more items</span>
                    </div>
                  )}
                </div>

                {/* Price Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium text-gray-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Discount</span>
                      <span className="font-medium text-green-600 dark:text-green-400">-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className={`font-medium ${shipping === 0 ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white"}`}>
                      {shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  {tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Tax</span>
                      <span className="font-medium text-gray-900 dark:text-white">₹{tax.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="pt-4 mt-4 border-t dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 dark:text-white">Total</span>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white text-xl">₹{total.toFixed(2)}</p>
                        {discount > 0 && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Save ₹{discount.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="mt-6 pt-6 border-t dark:border-gray-700">
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <Truck className="w-4 h-4" />
                    <span>Free delivery on orders above ₹299</span>
                  </div>
                </div>

                {/* Security Info */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">100% Secure Payment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Bar */}
      <MobileBottomBar
        currentStep={currentStep}
        addressId={addressId}
        total={total}
        discount={discount}
        paymentMethod={paymentMethod}
        setCurrentStep={setCurrentStep}
      />
    </div>
  );
};

export default CheckoutPage;
