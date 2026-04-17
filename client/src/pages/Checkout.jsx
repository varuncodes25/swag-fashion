import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initCheckout, setProductId ,setVariantId} from "@/redux/slices/checkoutSlice";
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

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
    <div className="min-h-screen bg-muted/30 dark:bg-card">
      {/* Header */}
      <header className="bg-card shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-primary dark:text-primary" />
              <h1 className="text-lg font-bold text-foreground">
                Checkout
              </h1>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="hidden sm:inline text-muted-foreground">
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
                      ? "bg-primary text-white"
                      : isActive
                      ? "bg-blue-100 dark:bg-primary/20 text-primary dark:text-primary border-2 border-primary"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:inline ${
                    isActive
                      ? "text-primary dark:text-primary"
                      : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>

                {index < 2 && (
                  <div
                    className={`w-12 h-0.5 ${
                      step.id === "address" && addressId
                        ? "bg-primary"
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
                <div className="bg-card rounded-2xl shadow-lg dark:shadow-foreground/10 border dark:border-gray-700 overflow-hidden transition-colors">
                  
                  <div className="p-6">
                    <AddressSection />
                  </div>
                </div>

                {/* Desktop Continue Button (Only when address selected) */}
                {addressId && (
                  <div className="hidden lg:flex justify-end mt-6">
                    <button
                      onClick={() => setCurrentStep("summary")}
                      className="px-8 py-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-3 group"
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
               <div className="bg-card rounded-2xl shadow-lg dark:shadow-foreground/10 border dark:border-gray-700 p-4 sm:p-6 transition-colors">
  {/* Header - Mobile Optimized */}
  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-4">
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-success to-success/90 flex items-center justify-center shadow-lg flex-shrink-0">
        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-foreground text-base sm:text-lg truncate">
          Delivery Address
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground truncate">
          Confirmed for delivery
        </p>
      </div>
    </div>
    
    <button
      onClick={() => setCurrentStep("address")}
      className="px-3 py-1.5 sm:px-4 sm:py-2 text-primary dark:text-primary hover:text-primary dark:hover:text-pink-300 font-medium bg-primary/10 dark:bg-primary/15 rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto text-center"
    >
      Change
    </button>
  </div>
  
  {/* Address Details - Mobile Optimized */}
  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-4 sm:p-5 border dark:border-gray-700">
    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
      {/* Icon - Hidden on very small screens or adjust size */}
      <div className="hidden xs:flex w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
        <span className="text-primary dark:text-primary text-base sm:text-lg">📍</span>
      </div>
      
      {/* Address Content - With proper text wrapping */}
      <div className="flex-1 min-w-0 w-full">
        {/* Name */}
        <p className="font-semibold text-foreground text-sm sm:text-base break-words">
          {selectedAddress?.name}
        </p>
        
        {/* Address lines - Break long words */}
        <p className="text-gray-700 dark:text-gray-300 mt-1.5 sm:mt-2 text-xs sm:text-sm break-words">
          {selectedAddress?.address_line1}
        </p>
        
        {/* City, State, Pincode */}
        <p className="text-muted-foreground text-xs sm:text-sm break-words mt-1">
          {selectedAddress?.city}, {selectedAddress?.state} - {selectedAddress?.pincode}
        </p>
        
        {/* Contact Info - Stack on mobile, row on larger screens */}
        <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4 sm:gap-6 mt-3">
          {/* Phone */}
          <span className="text-muted-foreground flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm break-all">
            <span className="text-base sm:text-lg flex-shrink-0">📱</span>
            <span className="truncate">{selectedAddress?.phone}</span>
          </span>
          
          {/* Email - Optional, hide on very small screens if too long */}
          {selectedAddress?.email && (
            <span className="text-muted-foreground flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm break-all">
              <span className="text-base sm:text-lg flex-shrink-0">✉️</span>
              <span className="truncate">{selectedAddress.email}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
</div>

                {/* Price Details Card */}
                
                {/* Desktop Continue Button */}
                <div className="hidden lg:flex justify-end">
                  <button
                    onClick={() => setCurrentStep("payment")}
                    className="px-8 py-4 bg-gradient-to-r from-primary to-primary/85 hover:from-primary/90 hover:to-primary/80 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-3 group"
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
                <div className="bg-card rounded-2xl shadow-lg dark:shadow-foreground/10 border dark:border-gray-700 p-6 transition-colors">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-success to-success/90 flex items-center justify-center shadow-lg">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-foreground text-xl">Payment Method</h2>
                      <p className="text-sm text-muted-foreground">Choose how you want to pay</p>
                    </div>
                  </div>
                  <PaymentMethod />
                </div>

                {/* Order Summary Card */}
                {/* <div className="bg-card rounded-2xl shadow-lg dark:shadow-foreground/10 border dark:border-gray-700 p-6 transition-colors">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-lg">Order Summary111</h3>
                      <p className="text-sm text-muted-foreground">Review your items</p>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                    {items.map((item) => (
                      <div key={item.productId} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                        <div className="relative">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600 group-hover:border-primary dark:group-hover:border-pink-400 transition-colors"
                          />
                          {item.quantity > 1 && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-primary to-primary/85 text-white text-xs rounded-full flex items-center justify-center shadow-lg">
                              {item.quantity}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{item.name}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                            {item.discountAmount > 0 && (
                              <span className="text-sm text-success">Save ₹{item.discountAmount.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">₹{(item.lineTotal || 0).toFixed(2)}</p>
                          {item.discountAmount > 0 && (
                            <p className="text-sm text-muted-foreground line-through">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground text-lg">Total Amountgggg</span>
                      <div className="text-right">
                        <p className="font-bold text-foreground text-2xl">₹{total.toFixed(2)}</p>
                        {discount > 0 && (
                          <p className="text-sm text-success">You saved ₹{discount.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div> */}

                {/* Desktop Place Order Button */}
                <div className="hidden lg:block">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-foreground text-lg">Ready to Place Order?</p>
                        <p className="text-sm text-muted-foreground">Review everything before confirming</p>
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
          <div className="">
            <div className="sticky top-32">
              <div className="bg-card rounded-2xl shadow-xl dark:shadow-foreground/10 border dark:border-gray-700 p-6 transition-colors">
                <h3 className="font-bold text-foreground text-lg mb-6 pb-4 border-b dark:border-gray-700">Order Summary</h3>
                
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
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                          <span className="text-sm font-semibold text-foreground">₹{(item.lineTotal || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {items.length > 3 && (
                    <div className="text-center pt-2">
                      <span className="text-sm text-muted-foreground">+ {items.length - 3} more items</span>
                    </div>
                  )}
                </div>

                {/* Price Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">₹{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium text-success">-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={`font-medium ${shipping === 0 ? "text-success" : "text-foreground"}`}>
                      {shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  {tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-medium text-foreground">₹{tax.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="pt-4 mt-4 border-t dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground">Total</span>
                      <div className="text-right">
                        <p className="font-bold text-foreground text-xl">₹{total.toFixed(2)}</p>
                        {discount > 0 && (
                          <p className="text-xs text-success mt-1">
                            Save ₹{discount.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Info */}
                

                {/* Security Info */}
                <div className="mt-4 p-3 bg-primary/10 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-primary/30">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary dark:text-primary" />
                    <span className="text-sm text-primary dark:text-primary">100% Secure Payment</span>
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
