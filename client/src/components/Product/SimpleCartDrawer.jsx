// components/Product/SimpleCartDrawer.jsx
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  X,
  ShoppingBag,
  ArrowRight,
  Tag,
  ChevronRight,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import CartProduct from "../custom/CartProduct";
import { useNavigate, useLocation } from "react-router-dom";

const SimpleCartDrawer = ({
  iconSize = 20,
  className = "",
  open = false,
  onOpenChange,
  showIconOnly = false,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const itemsContainerRef = useRef(null);

  const { isAuthenticated } = useSelector((state) => state.auth);
  
  
const cartState = useSelector((state) => state.cart);

// ✅ Sahi tarike se extract karo
const items = cartState?.items || [];
const summary = cartState?.summary || {};
const loading = cartState?.loading || false;

// ✅ Summary se values lo
const totalPrice = summary?.totalPrice || 0;
const totalDiscount = summary?.totalDiscount || 0;
const totalItems = summary?.totalItems || 0;
const estimatedDelivery = summary?.estimatedDelivery || "";

// ✅ Calculate properly
const subtotal = totalPrice + totalDiscount; // MRP before discount
const totalSavings = totalDiscount;
const itemCount = items.length;

console.log("📊 Cart Values:", {
  items: items.length,
  totalPrice,
  totalDiscount,
  subtotal,
  itemCount,
  summary
});
  
  // ✅ Fix: Calculate display price
  const displayPrice = totalPrice || subtotal - totalSavings || 0;

  const isCheckoutPage = location.pathname === "/checkout";

  // Scroll to top when drawer opens
  useEffect(() => {
    if (open && itemsContainerRef.current) {
      itemsContainerRef.current.scrollTop = 0;
    }
  }, [open]);

  // Icon only mode
  if (showIconOnly) {
    return (
      <button
        onClick={() => onOpenChange?.(true)}
        disabled={isCheckoutPage}
        className={`relative group ${className}`}
        aria-label="Open cart"
      >
        <div className="absolute inset-0 bg-emerald-100 dark:bg-emerald-900/30 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
        <ShoppingCart
          size={iconSize}
          className={`relative z-10 transition-all duration-300 ${
            isCheckoutPage
              ? "text-gray-400 dark:text-gray-600"
              : "text-success group-hover:text-emerald-700 dark:group-hover:text-emerald-300 group-hover:scale-110"
          }`}
          strokeWidth={1.5}
        />
        {itemCount > 0 && !isCheckoutPage && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {itemCount > 9 ? '9+' : itemCount}
          </span>
        )}
        <div className="absolute -inset-1 bg-emerald-500/20 dark:bg-emerald-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>
    );
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-300"
        onClick={() => onOpenChange?.(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[380px] lg:w-[420px] bg-card z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        {/* HEADER */}
        <div className="relative bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-500 dark:to-green-500 px-4 py-3 flex-shrink-0">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>

          <div className="relative flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute -inset-1 bg-white/30 rounded-full blur-md"></div>
                <div className="relative bg-white/20 backdrop-blur p-1.5 rounded-full">
                  <ShoppingBag size={18} className="text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Cart
                  <span className="bg-white/20 backdrop-blur px-2 py-0.5 rounded-full text-xs font-medium">
                    {itemCount}
                  </span>
                </h2>
              </div>
            </div>

            <button
              onClick={() => onOpenChange?.(false)}
              className="relative group p-1"
              aria-label="Close cart"
            >
              <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              <X
                size={18}
                className="relative text-white group-hover:rotate-90 transition-transform duration-300"
              />
            </button>
          </div>
        </div>

        {/* ITEMS SECTION */}
        <div
          ref={itemsContainerRef}
          className="flex-1 overflow-y-auto bg-muted/40"
          style={{
            height: isAuthenticated && items.length > 0
              ? "calc(100vh - 180px)"
              : "100%",
          }}
        >
          {!isAuthenticated ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl"></div>
                <div className="relative bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50 p-4 rounded-full">
                  <ShoppingCart size={48} className="text-success" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1">
                Login to View Cart
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                Sign in to see your saved items
              </p>
              <div className="space-y-2 w-full max-w-xs">
                <Button
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => {
                    onOpenChange?.(false);
                    navigate("/login", { state: { from: location.pathname } });
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-2 hover:bg-gray-100 dark:hover:bg-gray-800 py-4 rounded-lg"
                  onClick={() => {
                    onOpenChange?.(false);
                    navigate("/");
                  }}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl"></div>
                <div className="relative bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50 p-4 rounded-full">
                  <ShoppingBag size={48} className="text-success" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1">
                Your Cart is Empty
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                Add items to get started
              </p>
              <div className="space-y-2 w-full max-w-xs">
                <Button
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
                  onClick={() => {
                    onOpenChange?.(false);
                    navigate("/");
                  }}
                >
                  <span>Start Shopping</span>
                  <ChevronRight
                    size={16}
                    className="ml-1 group-hover:translate-x-1 transition-transform"
                  />
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-2 hover:bg-gray-100 dark:hover:bg-gray-800 py-4 rounded-lg"
                  onClick={() => onOpenChange?.(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-3 space-y-3">
              {/* Cart Items */}
              <div className="space-y-2">
                {items.map((item, index) => (
                  <CartProduct
                    key={item._id || item.cartItemId || index}
                    {...item}
                  />
                ))}
              </div>
              {/* Extra padding for mobile */}
              <div className="h-24"></div>
            </div>
          )}
        </div>

        {/* FOOTER - Only show when authenticated and items exist */}
        {isAuthenticated && items.length > 0 && (
          <div className="bg-card border-t dark:border-gray-800 shadow-lg px-4 py-3 flex-shrink-0">
            {/* Price Summary */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">
                  ₹{(subtotal || totalPrice + totalSavings).toLocaleString("en-IN")}
                </span>
              </div>

              {totalSavings > 0 && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Tag size={12} className="text-green-600" />
                    Savings
                  </span>
                  <span className="font-medium text-success">
                    -₹{totalSavings.toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              {/* Total */}
              <div className="pt-2 border-t dark:border-gray-800">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-foreground">
                    Total
                  </span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-foreground">
                      ₹{displayPrice.toLocaleString("en-IN")}
                    </span>
                    <p className="text-[10px] text-muted-foreground">
                      incl. taxes
                    </p>
                  </div>
                </div>
              </div>

              {/* Estimated Delivery */}
              {summary?.estimatedDelivery && (
                <p className="text-[10px] text-muted-foreground text-center">
                  🚚 Estimated Delivery: {summary.estimatedDelivery}
                </p>
              )}

              {/* Checkout Button */}
              <Button
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 
                  hover:from-emerald-700 hover:to-green-700 
                  dark:from-emerald-500 dark:to-green-500 
                  dark:hover:from-emerald-600 dark:hover:to-green-600 
                  text-white py-3 text-sm font-semibold 
                  rounded-lg shadow-md hover:shadow-lg 
                  transition-all duration-300 transform hover:scale-[1.01]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  group"
                disabled={loading}
                onClick={() => {
                  onOpenChange?.(false);
                  navigate("/checkout");
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    PROCESSING...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    CHECKOUT
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SimpleCartDrawer;