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
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-2 sm:px-4 sm:py-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline text-sm">Back</span>
          </button>

          <div className="flex items-center gap-1.5">
            <ShoppingBag className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
            <h1 className="text-base font-bold text-foreground sm:text-lg">
              Checkout
            </h1>
          </div>

          <div className="flex items-center gap-1 text-xs sm:text-sm">
            <Shield className="h-3.5 w-3.5 text-green-600 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline text-muted-foreground">
              Secure
            </span>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="mx-auto max-w-6xl px-3 py-2 sm:px-4 sm:py-4">
        <div className="mb-2 flex items-center justify-center gap-1.5 sm:mb-6 sm:gap-8">
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
              <div key={step.id} className="flex items-center gap-1 sm:gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 sm:text-sm ${
                    isCompleted
                      ? "bg-primary text-white"
                      : isActive
                        ? "border-2 border-primary bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`hidden text-sm font-medium sm:inline ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>

                {index < 2 && (
                  <div
                    className={`h-0.5 w-6 sm:w-12 ${
                      step.id === "address" && addressId
                        ? "bg-primary"
                        : "bg-muted"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-3 py-2 pb-[4.75rem] sm:px-6 sm:py-6 sm:pb-8 lg:px-8 lg:py-8">
        <div className="grid grid-cols-1 gap-3 sm:gap-8 lg:grid-cols-3">
          <div className="space-y-3 sm:space-y-6 lg:col-span-2">
            {currentStep === "address" && (
              <div className="animate-fadeIn">
                <AddressSection />

                {/* Desktop Continue Button (Only when address selected) */}
                {addressId && (
                  <div className="hidden lg:flex justify-end mt-6">
                    <button
                      onClick={() => setCurrentStep("summary")}
                      className="btn-premium flex items-center gap-3 group"
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
              <div className="animate-fadeIn space-y-3 sm:space-y-6">
                <div className="rounded-xl border bg-card p-3 sm:rounded-2xl sm:p-6">
                  <div className="mb-2 flex items-center justify-between gap-2 sm:mb-4">
                    <div className="flex min-w-0 items-center gap-2">
                      <CheckCircle className="h-4 w-4 shrink-0 text-green-600 sm:h-5 sm:w-5" />
                      <h3 className="truncate text-sm font-semibold text-foreground sm:text-lg">
                        Delivery Address
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep("address")}
                      className="shrink-0 text-xs font-medium text-primary sm:text-sm"
                    >
                      Change
                    </button>
                  </div>

                  <div className="rounded-lg bg-muted/40 p-3 text-xs sm:p-4 sm:text-sm">
                    <p className="font-semibold text-foreground">
                      {selectedAddress?.name}
                    </p>
                    <p className="mt-1 break-words text-muted-foreground">
                      {selectedAddress?.address_line1}
                      {selectedAddress?.address_line2
                        ? `, ${selectedAddress.address_line2}`
                        : ""}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      {selectedAddress?.city}, {selectedAddress?.state} -{" "}
                      {selectedAddress?.pincode}
                    </p>
                    <p className="mt-2 text-muted-foreground">
                      {selectedAddress?.phone}
                    </p>
                  </div>
                </div>

                {/* Mobile price summary */}
                <div className="rounded-xl border bg-card p-3 lg:hidden">
                  <h3 className="mb-2 text-sm font-semibold">Order Total</h3>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-₹{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>
                        {shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-1.5 font-bold">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:flex justify-end">
                  <button
                    onClick={() => setCurrentStep("payment")}
                    className="btn-premium flex items-center gap-3 group"
                  >
                    <span>Continue to Payment</span>
                    <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === "payment" && (
              <div className="animate-fadeIn space-y-3 sm:space-y-6">
                <div className="rounded-xl border bg-card p-3 sm:rounded-2xl sm:p-6">
                  <div className="mb-3 hidden items-center gap-3 sm:mb-6 sm:flex">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">
                        Payment Method
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Choose how you want to pay
                      </p>
                    </div>
                  </div>
                  <PaymentMethod compact />
                </div>

                {/* Desktop Place Order Button */}
                <div className="hidden lg:block">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-4 sm:p-6 border dark:border-gray-700">
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
              <div className="bg-card rounded-2xl shadow-xl dark:shadow-foreground/10 border dark:border-gray-700 p-4 sm:p-6 transition-colors">
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
        paymentMethod={paymentMethod}
        setCurrentStep={setCurrentStep}
      />
    </div>
  );
};

export default CheckoutPage;
