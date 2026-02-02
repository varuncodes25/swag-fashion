// hooks/useAddToCart.js
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/redux/slices/cartSlice";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

/**
 * Add to Cart Hook - Product page ke liye
 * Yeh hook product page me use hoga
 */
const useAddToCart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Add to Cart Function
   * @param {Object} cartData - Product ka data
   * @param {string} cartData.productId - Product ID
   * @param {string} cartData.variantId - Variant ID (selected color/size)
   * @param {number} cartData.quantity - Quantity (default: 1)
   * @param {string} cartData.productName - Product name (for success message)
   * @param {string} cartData.variantColor - Selected color (for success message)
   */
  const addToCartHandler = async (cartData) => {
    // Reset error
    setError(null);
    
    // ✅ Step 1: Validation
    if (!isAuthenticated) {
      setError("Please login to add items to cart");
      toast({
        title: "Login Required",
        description: "Please login to add items to cart",
        variant: "destructive",
      });
      navigate("/login");
      return { success: false, error: "Login required" };
    }

    if (!cartData.productId || !cartData.variantId) {
      setError("Product or variant not selected");
      toast({
        title: "Selection Required",
        description: "Please select color and size",
        variant: "destructive",
      });
      return { success: false, error: "Variant not selected" };
    }

    if (!cartData.quantity || cartData.quantity < 1) {
      setError("Quantity must be at least 1");
      toast({
        title: "Invalid Quantity",
        description: "Quantity must be at least 1",
        variant: "destructive",
      });
      return { success: false, error: "Invalid quantity" };
    }

    // ✅ Step 2: Start loading
    setLoading(true);

    try {
      // ✅ Step 3: Dispatch to Redux
      const result = await dispatch(
        addToCart({
          productId: cartData.productId,
          variantId: cartData.variantId,
          quantity: cartData.quantity,
        })
      ).unwrap();

      // ✅ Step 4: Success handling
      const successMessage = cartData.productName
        ? `✅ ${cartData.productName} added to cart!`
        : "✅ Added to cart successfully!";
      
      toast({
        title: "Success!",
        description: successMessage,
        variant: "default",
      });

      setLoading(false);
      return { success: true, data: result };

    } catch (error) {
      // ✅ Step 5: Error handling
      console.error("Add to cart error:", error);
      
      const errorMessage = error || "Failed to add to cart. Please try again.";
      setError(errorMessage);
      
      toast({
        title: "Failed",
        description: errorMessage,
        variant: "destructive",
      });

      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Add to Cart and Navigate to Cart Page
   */
  const addToCartAndGo = async (cartData) => {
    const result = await addToCartHandler(cartData);
    if (result.success) {
      // 2 second wait then navigate to cart
      setTimeout(() => {
        navigate("/cart");
      }, 2000);
    }
    return result;
  };

  /**
   * Quick Add to Cart (for product cards)
   */
  const quickAddToCart = async (productId, variantId) => {
    return await addToCartHandler({
      productId,
      variantId,
      quantity: 1,
    });
  };

  /**
   * Check if item is in cart
   * (Agar cart state me check karna ho)
   */
  const isItemInCart = (variantId, cartItems) => {
    if (!cartItems || !variantId) return false;
    return cartItems.some(item => item.variant._id === variantId);
  };

  /**
   * Get item quantity from cart
   */
  const getItemQuantity = (variantId, cartItems) => {
    if (!cartItems || !variantId) return 0;
    const item = cartItems.find(item => item.variant._id === variantId);
    return item ? item.quantity : 0;
  };

  return {
    // State
    loading,
    error,
    
    // Main Functions
    addToCart: addToCartHandler,
    addToCartAndGo,
    quickAddToCart,
    
    // Helper Functions
    isItemInCart,
    getItemQuantity,
    
    // Reset
    resetError: () => setError(null),
  };
};

export default useAddToCart;