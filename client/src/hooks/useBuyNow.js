import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useRazorpay from "./use-razorpay";

const useBuyNow = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { verifyPayment, generatePayment } = useRazorpay();
  const [loading, setLoading] = useState(false);

  const buyNow = async ({ productId, variantId, quantity, color, size }) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // ✅ BUILD URL WITH ALL NECESSARY PARAMETERS
    const params = new URLSearchParams();
    
    // ✅ REQUIRED: Product ID
    params.append('productId', productId);
    
    // ✅ REQUIRED: Variant ID (MOST IMPORTANT!)
    if (variantId) {
      params.append('variantId', variantId);
    }
    
    // ✅ OPTIONAL: Color and Size (for reference)
    if (color) {
      params.append('color', color);
    }
    
    if (size) {
      params.append('size', size);
    }
    
    // ✅ Quantity
    params.append('quantity', quantity || 1);

    // ✅ Redirect to checkout page
    navigate(`/checkout?${params.toString()}`);
  };

  return { buyNow, loading };
};

export default useBuyNow;