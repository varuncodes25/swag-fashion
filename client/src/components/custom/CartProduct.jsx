// components/custom/CartProduct.jsx
import React, { useState, useEffect } from "react";
import { Minus, Plus, Trash } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { removeFromCart, decreaseQuantity, increaseQuantity } from "@/redux/slices/cartSlice";
import { useToast } from "@/hooks/use-toast";

const CartProduct = ({
  name,
  price,
  cartItemId,
  productId,
  image,
  quantity,
  stock,
  blacklisted,
  color,
  size,
  _id,
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const itemId = cartItemId || _id;
  const [isLoading, setIsLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRemove = async () => {
    if (!itemId) return;
    setIsRemoving(true);
    try {
      await dispatch(removeFromCart(itemId)).unwrap();
      toast({ title: "Item removed from cart" });
    } catch (error) {
      toast({ title: "Failed to remove item", variant: "destructive" });
    } finally {
      setIsRemoving(false);
    }
  };

  const handleDecrease = async () => {
    if (!itemId) return;
    if (quantity === 1) {
      handleRemove();
      return;
    }
    setIsUpdating(true);
    try {
      await dispatch(decreaseQuantity(itemId)).unwrap();
    } catch (error) {
      toast({ title: "Failed to update quantity", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIncrease = async () => {
    if (!itemId || quantity >= stock) return;
    setIsUpdating(true);
    try {
      await dispatch(increaseQuantity(itemId)).unwrap();
    } catch (error) {
      toast({ title: "Failed to update quantity", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    // Navigate to checkout with this item
    navigate("/checkout", { 
      state: { 
        buyNowItem: { productId, variantId: itemId, quantity, color, size, price, name, image } 
      } 
    });
  };

  return (
    <div className="flex gap-3 p-2 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 last:border-0">
      
      {/* Image - Fixed size, no extra styling */}
      <div className="w-16 h-16 flex-shrink-0">
        <img
          src={image || "/placeholder.jpg"}
          alt={name}
          className="w-full h-full object-cover rounded"
        />
      </div>

      {/* Content - Flex-1 takes remaining space */}
      <div className="flex-1 min-w-0">
        
        {/* Title & Price Row */}
        <div className="flex justify-between items-start gap-2">
          <h4 className="text-sm font-medium truncate">{name}</h4>
          <span className="text-sm font-bold text-emerald-600 flex-shrink-0">₹{price}</span>
        </div>

        {/* Variants Row */}
        <div className="flex flex-wrap items-center gap-1 mt-0.5">
          {color && (
            <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
              {color}
            </span>
          )}
          {size && (
            <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
              {size}
            </span>
          )}
        </div>

        {/* Quantity & Actions Row */}
        <div className="flex items-center justify-between mt-2">
          
          {/* Quantity Controls - Compact */}
          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded">
            <button
              onClick={handleDecrease}
              disabled={!itemId || isUpdating}
              className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"
            >
              <Minus size={12} />
            </button>
            
            <span className="w-6 text-xs font-medium text-center">
              {isUpdating ? '...' : quantity}
            </span>
            
            <button
              onClick={handleIncrease}
              disabled={!itemId || isUpdating || quantity >= stock}
              className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Action Buttons - Compact */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleRemove}
              disabled={!itemId || isRemoving}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-40"
              title="Remove"
            >
              {isRemoving ? <span className="text-xs">...</span> : <Trash size={14} />}
            </button>
            
            <Button
              onClick={handleBuyNow}
              size="sm"
              className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700"
              disabled={!isAuthenticated || blacklisted || quantity > stock}
            >
              Buy
            </Button>
          </div>
        </div>

        {/* Stock Warning - Only if low stock */}
        {stock < 5 && stock > 0 && (
          <div className="mt-1 text-[10px] text-amber-600">
            Only {stock} left
          </div>
        )}
        
      </div>
    </div>
  );
};

export default CartProduct;