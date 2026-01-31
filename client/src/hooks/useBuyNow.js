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

  const buyNow = async ({ productId, quantity }) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // For now, redirect to checkout with product details
    navigate(`/checkout?productId=${productId}&quantity=${quantity}`);
  };

  return { buyNow, loading };
};

export default useBuyNow;