import React, { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "../ui/button";
import { ShoppingCart } from "lucide-react";
import { Badge } from "../ui/badge";
import { useSelector } from "react-redux";
import CartProduct from "./CartProduct";
import { useNavigate } from "react-router-dom";

const CartDrawer = () => {
  const { cartItems, totalQuantity, totalPrice } = useSelector(
    (state) => state.cart
  );

  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = () => {
    // Close drawer first
    setOpen(false);

    // Small timeout ensures drawer animation finishes
    setTimeout(() => {
      navigate("/checkout"); // Navigate to checkout page
    }, 200);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger className="relative" aria-label="Open cart">
        <ShoppingCart
          className="text-gray-800 dark:text-white hover:scale-105 transition-all ease-in-out cursor-pointer"
          strokeWidth={1.3}
          size={28}
        />
        {totalQuantity > 0 && (
          <Badge className="absolute top-0 right-0 px-1 py-0 text-xs">
            {totalQuantity}
          </Badge>
        )}
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Your Cart</DrawerTitle>
          <DrawerDescription>
            Total Items: {totalQuantity}, Total Price: ₹{totalPrice}
          </DrawerDescription>
        </DrawerHeader>

        {/* Cart Items */}
        <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto px-4">
          {cartItems.length === 0 ? (
            <h2 className="text-primary text-sm">
              Nothing To Show, Please add some products...
            </h2>
          ) : (
            cartItems.map((item) => <CartProduct key={item._id} {...item} />)
          )}
        </div>

        {/* Footer */}
        <DrawerFooter className="flex flex-col items-start gap-3">
          <div className="w-full flex justify-between text-base font-semibold">
            <span>Total:</span>
            <span>₹{totalPrice}</span>
          </div>
          <Button onClick={handleCheckout} className="w-full">
            Checkout
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default CartDrawer;
