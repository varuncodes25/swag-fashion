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
          <Badge className="absolute -top-2 -right-2 px-2 py-0 text-xs min-w-[20px] h-5 flex items-center justify-center">
            {totalQuantity}
          </Badge>
        )}
      </DrawerTrigger>

      <DrawerContent className="ml-auto w-full sm:w-[400px] h-full">
        <div className="flex flex-col h-full">
          <DrawerHeader>
            <DrawerTitle>Your Cart</DrawerTitle>
            <DrawerDescription>
              Total Items: {totalQuantity}, Total Price: ₹{totalPrice}
            </DrawerDescription>
          </DrawerHeader>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-4">
            {cartItems.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-center">
                  Your cart is empty. Add some products to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                {cartItems.map((item) => (
                  <CartProduct key={item._id} {...item} />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <DrawerFooter className="border-t pt-4">
            <div className="w-full flex justify-between text-lg font-semibold mb-4">
              <span>Total:</span>
              <span>₹{totalPrice}</span>
            </div>
            <Button 
              onClick={handleCheckout} 
              className="w-full"
              disabled={cartItems.length === 0}
            >
              Checkout
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CartDrawer;