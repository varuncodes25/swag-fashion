import { Colors } from "@/constants/colors";
import { useToast } from "@/hooks/use-toast";
import { addToCart, removeFromCart } from "@/redux/slices/cartSlice";
import { Minus, Plus, Trash } from "lucide-react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useRazorpay from "@/hooks/use-razorpay";
import useCart from "@/hooks/useCart";

const CartProduct = ({
  name,
  price,
  cartItemId,   // ✅ cart item ID for removal
  productId,    // ✅ actual product ID for buy now
  image,
  quantity,
  stock,
  blacklisted,
  color,
  size,
}) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { generatePayment, verifyPayment } = useRazorpay();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { fetchCart } = useCart();

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (quantity > stock) {
      toast({ title: "Product out of stock" });
      return;
    }

    if (blacklisted) {
      toast({ title: "Product isn't available for purchase" });
      return;
    }

    if (!color) {
      toast({ title: "Please select a color" });
      return;
    }

    const order = await generatePayment(price * quantity);
    await verifyPayment(order, [{ id: productId, quantity, color, size }], "123 Main street");
    fetchCart(); // refresh cart after buy
  };

  const handleRemove = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      console.log(cartItemId)
      if (!user && !cartItemId) return;

      await axios.delete(`${import.meta.env.VITE_API_URL}/cart/remove`, {
        data: { userId: user.id, cartItemId }, // use correct cart item ID
      });

      toast({ title: "Product removed from cart" });
      fetchCart(user.id);
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to remove product" });
    }
  };

  return (
    <div className="border w-fit rounded-2xl overflow-clip grid relative hover:shadow-md">
      <img
        src={image}
        alt={name}
        className="w-[30rem] sm:w-[20rem] h-[20rem] object-cover rounded-t-2xl"
      />
      <div className="px-3 grid gap-1 py-2 absolute bg-white dark:bg-zinc-900 w-full bottom-0 rounded-xl">
        <h2 className="text-md">{name}</h2>
        <span className="font-semibold text-md">₹{price}</span>

        <div className="flex justify-between items-center my-2">
          <div className="flex gap-3 items-center">
            <div className="flex items-center gap-5 bg-gray-100 rounded-lg px-3 py-2 w-fit">
              <Minus
                size={15}
                stroke={Colors.customGray}
                onClick={() => {
                  if (quantity > 1) {
                    dispatch(removeFromCart({ productId, quantity: 1, color, size }));
                  } else {
                    handleRemove();
                  }
                }}
              />
              <span className="text-slate-950 text-sm sm:text-md">{quantity}</span>
              <Plus
                size={15}
                stroke={Colors.customGray}
                onClick={() => {
                  stock === quantity
                    ? toast({ title: "Maximum stock reached" })
                    : dispatch(addToCart({ productId, quantity: 1, color, size }));
                }}
              />
            </div>
          </div>

          {/* Remove Button */}
          <Trash
            size={20}
            className="text-red-500 cursor-pointer hover:scale-110 transition"
            onClick={handleRemove} // ✅ uses cartItemId
          />

          <Button onClick={handleBuyNow} size="sm">
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartProduct;
