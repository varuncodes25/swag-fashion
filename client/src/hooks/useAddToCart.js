import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const useAddToCart = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleAddToCart = async ({ productId, quantity, price, color, size }) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!color) {
      toast({ title: "Please select a color" });
      return;
    }

    if (!size) {
      toast({ title: "Please select a size" });
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/add`,
        {
          userId: user.id,
          productId,
          quantity,
          price,
          color,
          size,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        toast({ title: "Product added to cart" });
      } else {
        toast({ title: res.data.message || "Failed to add product" });
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast({ title: "Failed to add product to cart" });
    }
  };

  return { handleAddToCart };
};

export default useAddToCart;