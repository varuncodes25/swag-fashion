import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, Heart, Sparkles, ShoppingCart } from "lucide-react";
import { ModeToggle } from "./ModeToggle";
import LogoutToggle from "./LogoutToggle";
import { useDispatch, useSelector } from "react-redux";
import swagiconDark from "@/assets/iconwhite.png";
import SimpleCartDrawer from "../Product/SimpleCartDrawer";
import { fetchWishlist } from "@/redux/slices/wishlistSlice";
import { fetchCart } from "@/redux/slices/cartSlice";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartBadgeKey, setCartBadgeKey] = useState(0);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { wishlistStatus } = useSelector((state) => state.wishlist || {});
  const wishlistCount = Object.values(wishlistStatus || {}).filter(Boolean).length;

  // ✅ FIXED: Cart state access according to your cartSlice structure
  const cartState = useSelector((state) => state.cart) || {};
  const { 
    items = [], 
    cartItems = [], 
    cartCount = 0, 
    totalItems = 0,
    totalQuantity = 0,
    loading = false 
  } = cartState;

  // ✅ FIXED: Use cartCount directly from state (your slice has cartCount)
  const displayCartCount = cartCount || totalItems || totalQuantity || items.length || 0;
  
  console.log("Cart State:", { cartCount, totalItems, totalQuantity, itemsLength: items.length });
  console.log("Display Cart Count:", displayCartCount);

  const isCheckoutPage = location.pathname === "/checkout";

  
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  // Function to open cart drawer
  const openCartDrawer = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsCartOpen(true);
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700 shadow-sm">
        <div className="flex items-center justify-between px-3 sm:px-5 py-2">
          {/* LOGO */}
          <Link to="/" className="flex items-center group">
            <div className="relative group">
              <img
                src={swagiconDark}
                alt="Logo"
                className="w-28 h-12 sm:w-32 sm:h-14 object-contain 
                  transition-all duration-300 
                  group-hover:scale-105"
              />
            </div>

            <div className="ml-2 hidden sm:block">
              <div className="relative inline-block">
                <span className="
                  text-lg font-extrabold 
                  bg-gradient-to-r 
                  from-purple-600 via-pink-500 to-rose-500
                  dark:from-purple-400 dark:via-pink-400 dark:to-rose-400
                  bg-clip-text text-transparent
                  tracking-tight
                  relative z-10
                ">
                  ShreeLaxmiShop
                </span>
                
                <div className="
                  absolute -inset-1 -z-10
                  bg-gradient-to-r 
                  from-purple-500/30 via-pink-500/20 to-rose-500/30
                  blur-lg opacity-70
                  dark:from-purple-400/40 dark:via-pink-400/30 dark:to-rose-400/40
                "></div>
              </div>

              <div className="flex items-center gap-1.5 mt-1">
                <div className="
                  w-2.5 h-2.5 rounded-full
                  bg-gradient-to-br from-amber-400 to-yellow-500
                  dark:from-yellow-300 dark:to-amber-400
                  flex items-center justify-center
                ">
                  <Sparkles size={7} className="text-white" />
                </div>
                
                <span className="
                  text-[10px] font-medium tracking-wider
                  text-gray-600 dark:text-gray-300
                  uppercase
                ">
                  Premium Fashion
                </span>
              </div>
            </div>
          </Link>

          {/* RIGHT ICONS */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <div className="hover:scale-105 transition-transform">
              <ModeToggle />
            </div>

            {/* Wishlist */}
            <Link 
              to={isAuthenticated ? "/account/wishlist" : "/login"} 
              className="relative group"
              state={{ from: location.pathname }}
            >
              <button
                aria-label="Wishlist"
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full 
                  bg-gradient-to-br from-pink-50 to-rose-50 
                  dark:from-pink-900/20 dark:to-rose-900/20 
                  hover:from-pink-100 hover:to-rose-100 
                  dark:hover:from-pink-800/30 dark:hover:to-rose-800/30 
                  border border-pink-100 dark:border-pink-800/30 
                  hover:shadow-sm transition-all duration-200"
              >
                <Heart
                  size={18}
                  className="text-pink-500 dark:text-pink-400 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors"
                  strokeWidth={1.5}
                  fill={wishlistCount > 0 ? "currentColor" : "none"}
                />
              </button>
              {wishlistCount > 0 && isAuthenticated && (
                <span 
                  key={`wishlist-${wishlistCount}`}
                  className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 
                    flex items-center justify-center 
                    bg-gradient-to-br from-pink-500 to-rose-500 
                    text-white text-[10px] font-bold rounded-full 
                    shadow-lg ring-2 ring-white dark:ring-gray-900
                    animate-in zoom-in duration-200"
                >
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart - FIXED */}
            <div className="relative group">
              <button
                onClick={openCartDrawer}
                disabled={isCheckoutPage || loading}
                aria-label="Open cart"
                className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full 
                  transition-all duration-200 
                  ${isCheckoutPage || loading
                    ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60"
                    : "bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-800/30 dark:hover:to-green-800/30 border border-emerald-100 dark:border-emerald-800/30 hover:shadow-sm hover:scale-105"
                  }`}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <ShoppingCart
                    size={18}
                    className={isCheckoutPage 
                      ? "text-gray-400 dark:text-gray-500"
                      : "text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300"
                    }
                    strokeWidth={1.5}
                  />
                )}
              </button>

              {/* ✅ FIXED: Cart Badge - Using displayCartCount */}
              {displayCartCount > 0 && !isCheckoutPage && isAuthenticated && (
                <span 
                  key={`cart-badge-${cartBadgeKey}-${displayCartCount}`}
                  className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 
                    flex items-center justify-center 
                    bg-gradient-to-r from-emerald-500 to-green-600 
                    text-white text-[10px] font-bold rounded-full 
                    shadow-lg ring-2 ring-white dark:ring-gray-900
                    animate-in zoom-in duration-200
                  "
                >
                  {displayCartCount > 99 ? "99+" : displayCartCount}
                </span>
              )}
            </div>

            {/* Account */}
            <div className="relative group">
              {isAuthenticated ? (
                <div className="relative">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full 
                    bg-gradient-to-br from-blue-50 to-indigo-50 
                    dark:from-blue-900/20 dark:to-indigo-900/20 
                    hover:from-blue-100 hover:to-indigo-100 
                    dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 
                    border border-blue-100 dark:border-blue-800/30 
                    hover:shadow-sm transition-all duration-200">
                    <LogoutToggle user={user} iconSize={18} />
                  </div>
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 
                    bg-gradient-to-br from-green-400 to-emerald-500 
                    rounded-full ring-2 ring-white dark:ring-gray-900">
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => navigate("/login", { state: { from: location.pathname } })}
                  aria-label="Login"
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full 
                    bg-gradient-to-br from-blue-50 to-indigo-50 
                    dark:from-blue-900/20 dark:to-indigo-900/20 
                    hover:from-blue-100 hover:to-indigo-100 
                    dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 
                    border border-blue-100 dark:border-blue-800/30 
                    hover:shadow-sm hover:scale-105 transition-all duration-200"
                >
                  <User
                    size={18}
                    className="text-blue-600 dark:text-blue-400"
                    strokeWidth={1.5}
                  />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-gray-100 dark:via-gray-700 to-transparent"></div>
      </nav>

      {/* Cart Drawer */}
       <SimpleCartDrawer 
        open={isCartOpen}
        onOpenChange={setIsCartOpen}
      />
    </>
  );
};

export default Navbar;