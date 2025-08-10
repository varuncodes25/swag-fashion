import axios from "axios";
import { useToast } from "./use-toast";
import { useNavigate } from "react-router-dom";

const useRazorpay = () => {
  const navigate = useNavigate();
  const {toast} = useToast()
console.log("useRazorpay hook initialized",import.meta.env.VITE_RAZORPAY_KEY_ID,import.meta.env.VITE_API_URL);
  const generatePayment = async (amount) => {
    try {
      console.log("Generating payment for amount:", amount);
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/generate-payment",
        { amount },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Payment generated successfully:", res.data);
      const data = await res.data;
      return data.data;
    } catch (error) {
      return toast({
        title: error.response.data.message,
        variant: "destructive",
      });
    }
  };

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const verifyPayment = async (options, productArray, address, navigate) => {
  const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
  if (!res) {
    return toast({
      title: "Failed to load Razorpay",
      variant: "destructive",
    });
  }

  const paymentObject = new window.Razorpay({
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    ...options,
    handler: async (response) => {
      try {
        const res = await axios.post(
          import.meta.env.VITE_API_URL + "/verify-payment",
          {
            razorpay_order_id: options.id,
            razorpay_payment_id: response.razorpay_payment_id,
            amount: options.amount,
            address,
            productArray,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const { data } = await res;
        toast({ title: data.message });
    window.location.href = "/success";
      } catch (error) {
        toast({
          title: error.response?.data?.message || "Payment verification failed",
          variant: "destructive",
        });
      }
    },
    theme: {
      color: "#3399cc",
    },
  });

  paymentObject.open();
};


  return { generatePayment, verifyPayment };
};

export default useRazorpay;
