import axios from "axios";
import { useDispatch } from "react-redux";
import { setCart } from "@/redux/slices/cartSlice";
import useCart from "./useCart";

const useCartActions = () => {
  const dispatch = useDispatch();
  const { fetchCart } = useCart();

  const addToCart = async ({
    userId,
    productId,
    quantity,
    price,
    color,
    size,
    toast,
    setQuantityCallback, // optional: reset quantity after adding
  }) => {
    try {
      if (!userId) return;

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/add`, {
        userId,
        productId,
        quantity,
        price,
        color,
        size,
      });

      if (res.data.success) {
        // ✅ Fetch updated cart from backend
        await fetchCart(userId);

        if (setQuantityCallback) setQuantityCallback(1); // reset quantity if needed
        if (toast) toast({ title: "Product added to cart" });
      } else {
        if (toast) toast({ title: "Failed to add product to cart" });
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      if (toast) toast({ title: "Failed to add product to cart" });
    }
  };

  return { addToCart };
};

export default useCartActions;
