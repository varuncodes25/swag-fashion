import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ModeToggle } from "./ModeToggle";
import CartDrawer from "./CartDrawer";
import { User, Menu, ChevronLeft, X, Sparkles } from "lucide-react";
import LogoutToggle from "./LogoutToggle";
import { useSelector } from "react-redux";
import swagiconDark from "@/assets/iconwhite.png";
const Navbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleNavigate = () => {
    navigate("/");
  };

  return (
    <nav className="relative border-b dark:bg-zinc-900 bg-white px-4 sm:px-6 py-3 sm:py-4">
      {/* Top nav row */}
      <div className="flex justify-between items-center relative">
        {/* Left arrow */}
        <div className="flex items-center z-10">
          <ChevronLeft
            className="w-5 h-5 text-black dark:text-white cursor-pointer"
            onClick={handleNavigate}
          />
        </div>

        {/* Logo centered */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-xl sm:text-2xl font-bold text-black dark:text-white">
  <Link
    to="/"
    className="flex items-center gap-2 hover:text-pink-500 transition-colors duration-300"
  >
    <img
      src={swagiconDark}
      alt="Swag Icon Dark"
      className="h-20 w-20 sm:h-24 sm:w-24 lg:h-36 lg:w-40 rounded-full"
    />
  </Link>
</div>

        {/* Hamburger / Mobile toggle */}
        <button
          className="sm:hidden z-10 text-black dark:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        {/* Desktop items (hidden on mobile) */}
        <div className="hidden sm:flex items-center gap-4 text-black dark:text-white ">
          <ModeToggle />
          <CartDrawer />
          {isAuthenticated ? (
            <LogoutToggle user={user} />
          ) : (
            <Link to="/login">
              <User size={26} strokeWidth={1.3} className="hover:scale-105" />
            </Link>
          )}
          <Link to="/about">About</Link>
          <Link to="/faq">FAQ</Link>
        </div>
      </div>
      {/* Hamburger / Mobile toggle */}

      {/* Mobile floating menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-64 sm:w-72 bg-white/90 dark:bg-zinc-900/90 h-full shadow-xl px-6 py-6 flex flex-col gap-5 text-base text-black dark:text-white relative rounded-l-xl">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-black dark:text-white hover:rotate-90 transition-transform"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Menu Items */}
            <div className="mt-12 grid grid-cols-1 gap-4  ">
              {/* Theme Toggle */}
              <div className="flex flex-col items-center gap-1 p-3 border-b border-zinc-300 dark:border-zinc-700 hover:text-primary transition">
                <ModeToggle />
                <span className="text-sm font-medium">Theme</span>
              </div>

              {/* Cart Drawer */}
              <div className="flex flex-col items-center gap-1 p-3 border-b border-zinc-300 dark:border-zinc-700 hover:text-primary transition">
                <CartDrawer />
                <span className="text-sm font-medium">Cart</span>
              </div>

              {/* Account */}
              {isAuthenticated ? (
                <div className="flex flex-col items-center gap-1 p-3 border-b border-zinc-300 dark:border-zinc-700 hover:text-primary transition">
                  <LogoutToggle user={user} />
                  <span className="text-sm font-medium">Account</span>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex flex-col items-center gap-1 p-3 border-b border-zinc-300 dark:border-zinc-700 hover:text-primary transition"
                >
                  <User size={22} strokeWidth={1.4} />
                  <span className="text-sm font-medium">Account</span>
                </Link>
              )}

              {/* About */}
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center gap-1 p-3 border-b border-zinc-300 dark:border-zinc-700 hover:text-primary transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium">About</span>
              </Link>

              {/* FAQ */}
              <Link
                to="/faq"
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center gap-1 p-3 border-b border-zinc-300 dark:border-zinc-700 hover:text-primary transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16h6m-9 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm font-medium">FAQ</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
