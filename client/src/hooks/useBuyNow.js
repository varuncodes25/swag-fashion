import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from 'react-hot-toast';  // ✅ Import hot toast
import useRazorpay from "./use-razorpay";

const useBuyNow = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { verifyPayment, generatePayment } = useRazorpay();
  const [loading, setLoading] = useState(false);

  const buyNow = async ({ productId, variantId, quantity, color, size }) => {
    // ✅ Check authentication
    if (!isAuthenticated) {
      toast.error("Please login to continue", {
        icon: '🔒',
        duration: 3000,
      });
      navigate("/login");
      return;
    }

    // ✅ Validate required fields
    if (!productId) {
      toast.error("Product ID is missing");
      return;
    }

    if (!variantId) {
      toast.error("Please select a product variant");
      return;
    }

    setLoading(true);

    // Show loading toast
    const loadingToast = toast.loading('Processing your order...');

    try {
      // ✅ BUILD URL WITH ALL NECESSARY PARAMETERS
      const params = new URLSearchParams();
      
      params.append('productId', productId);
      params.append('variantId', variantId);
      
      if (color) params.append('color', color);
      if (size) params.append('size', size);
      params.append('quantity', quantity || 1);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Success toast
      toast.success('Redirecting to checkout...', {
        icon: '🛒',
        duration: 2000,
      });

      // ✅ Redirect to checkout page
      setTimeout(() => {
        navigate(`/checkout?${params.toString()}`);
      }, 500);

    } catch (error) {
      // Error toast
      toast.error(error.message || "Something went wrong", {
        icon: '❌',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return { buyNow, loading };
};

export default useBuyNow;