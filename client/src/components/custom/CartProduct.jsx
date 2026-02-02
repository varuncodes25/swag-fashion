import { Colors } from "@/constants/colors";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, Trash } from "lucide-react";
import React, { useEffect, useState } from "react"; // Added useState
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import useRazorpay from "@/hooks/use-razorpay";
import useCart from "@/hooks/useCart";
import useCartActions from "@/hooks/useCartActions";
import { removeFromCart, decreaseQuantity, increaseQuantity } from "@/redux/slices/cartSlice";

const CartProduct = ({
  name,
  price,
  cartItemId, // Make sure this prop is coming
  productId,
  image,
  quantity,
  stock,
  blacklisted,
  color,
  size,
  _id, // Also check for _id (common backend field name)
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { generatePayment, verifyPayment } = useRazorpay();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { fetchCart } = useCart();
  
  // Use useState for user to avoid calling localStorage on every render
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Get user from localStorage once on component mount
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Error parsing user:", error);
    }
  }, []);
  
  // Use _id if cartItemId is not provided
  const itemId = cartItemId || _id;
  
  console.log("CartProduct Debug:", {
    itemId,
    cartItemId,
    _id,
    user,
    props: { name, price, quantity }
  });

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (quantity > stock) {
      toast({ title: "Product out of stock", variant: "destructive" });
      return;
    }

    if (blacklisted) {
      toast({ 
        title: "Product isn't available for purchase", 
        variant: "destructive" 
      });
      return;
    }

    if (!color) {
      toast({ title: "Please select a color", variant: "destructive" });
      return;
    }

    try {
      const order = await generatePayment(price * quantity);
      await verifyPayment(
        order,
        [{ id: productId, quantity, color, size }],
        "123 Main street"
      );
      fetchCart();
    } catch (error) {
      toast({ 
        title: "Payment failed", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleRemove = async () => {
    console.log("Remove clicked for itemId:", itemId);
    
    if (!itemId) {
      toast({ 
        title: "Cannot remove item", 
        description: "Item ID is missing",
        variant: "destructive" 
      });
      return;
    }

    try {
      const resultAction = await dispatch(removeFromCart(itemId));
      
      if (removeFromCart.fulfilled.match(resultAction)) {
        toast({ 
          title: "Product removed from cart", 
          variant: "default"
        });
      } else if (removeFromCart.rejected.match(resultAction)) {
        throw new Error(resultAction.payload || resultAction.error?.message);
      }
      
    } catch (err) {
      console.error("Remove error:", err);
      toast({ 
        title: "Failed to remove product", 
        description: err.message || "Please try again",
        variant: "destructive" 
      });
    }
  };

  const handleDecrease = async () => {
    console.log("Decrease clicked for itemId:", itemId);
    
    if (!itemId) {
      toast({ 
        title: "Cannot update quantity", 
        description: "Item ID is missing",
        variant: "destructive" 
      });
      return;
    }

    if (quantity > 1) {
      try {
        const resultAction = await dispatch(decreaseQuantity(itemId));
        
        if (decreaseQuantity.rejected.match(resultAction)) {
          toast({
            title: "Failed to update quantity",
            description: resultAction.payload || "Please try again",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Failed to update quantity",
          description: error.message,
          variant: "destructive"
        });
      }
    } else {
      handleRemove(); // remove item completely if quantity is 1
    }
  };

  const handleIncrease = async () => {
    console.log("Increase clicked for itemId:", itemId);
    
    if (!itemId) {
      toast({ 
        title: "Cannot update quantity", 
        description: "Item ID is missing",
        variant: "destructive" 
      });
      return;
    }

    if (stock === quantity) {
      toast({ title: "Maximum stock reached", variant: "destructive" });
      return;
    }

    try {
      const resultAction = await dispatch(increaseQuantity(itemId));
      
      if (increaseQuantity.rejected.match(resultAction)) {
        toast({
          title: "Failed to update quantity",
          description: resultAction.payload || "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Failed to update quantity",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Check if buttons should be disabled
  const isDisabled = !itemId;
  
  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white dark:bg-gray-900">
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="md:w-1/3">
          <img
            src={image}
            alt={name}
            className="w-full h-48 md:h-32 object-cover"
          />
        </div>
        
        {/* Content Section */}
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-lg font-semibold line-clamp-1">{name}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {color && (
                  <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    Color: {color}
                  </span>
                )}
                {size && (
                  <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    Size: {size}
                  </span>
                )}
              </div>
            </div>
            <span className="text-xl font-bold ml-4">₹{price}</span>
          </div>

          {/* Quantity Controls and Actions */}
          <div className="mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Quantity Controls */}
                <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                  <button
                    onClick={handleDecrease}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isDisabled}
                    title={isDisabled ? "Item ID missing" : "Decrease quantity"}
                  >
                    <Minus size={15} stroke={Colors.customGray} />
                  </button>
                  
                  <span className="text-base font-medium min-w-[24px] text-center">
                    {quantity}
                  </span>
                  
                  <button
                    onClick={handleIncrease}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isDisabled || stock === quantity}
                    title={stock === quantity ? "Out of stock" : "Increase quantity"}
                  >
                    <Plus size={15} stroke={Colors.customGray} />
                  </button>
                </div>
                
                {/* Stock Indicator */}
                {stock < 10 && (
                  <span className="text-sm text-amber-600 font-medium">
                    Only {stock} left
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Remove Button */}
                <button
                  onClick={handleRemove}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isDisabled}
                  title={isDisabled ? "Item ID missing" : "Remove item"}
                >
                  <Trash size={18} />
                </button>
                
                {/* Buy Now Button */}
                <Button 
                  onClick={handleBuyNow} 
                  size="sm"
                  disabled={!isAuthenticated || blacklisted || stock < quantity}
                  className="whitespace-nowrap"
                >
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
          
          {/* Subtotal */}
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
              <span className="font-semibold text-lg">₹{price * quantity}</span>
            </div>
            {stock - quantity > 0 && stock - quantity < 5 && (
              <div className="mt-1 text-xs text-amber-600">
                {stock - quantity} more available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartProduct;