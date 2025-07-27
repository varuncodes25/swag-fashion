import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { pathname } = useLocation();
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);

  if (isAuthenticated && role === "admin" && pathname === "/admin/login") {
    return <Navigate to="/admin/dashboard" />;
  }

  if (
    isAuthenticated &&
    role === "user" &&
    (pathname.startsWith("/admin/dashboard") || pathname === "/admin/login")
  ) {
    return <Navigate to="/" />;
  }

  if (!isAuthenticated && pathname.startsWith("/admin/dashboard")) {
    return <Navigate to="/" />;
  }

  if (
    isAuthenticated &&
    role === "user" &&
    (pathname === "/login" || pathname === "/signup")
  ) {
    return <Navigate to="/" />;
  }

  if (!isAuthenticated && pathname === "/orders") {
    return <Navigate to="/login" />;
  }

  if (isAuthenticated && cartItems.length === 0 && pathname === "/checkout") {
    return <Navigate to="/" />;
  }
  return children;
};

export default ProtectedRoute;
