// pages/Wishlist.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Home } from 'lucide-react';
import { fetchWishlist, toggleWishlist } from '@/redux/slices/wishlistSlice';
import { toast } from '@/hooks/use-toast';
import ProductCard from '@/components/custom/ProductCard';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: wishlistItems, loading } = useSelector((state) => state.wishlist);

  // Fetch wishlist on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [isAuthenticated, dispatch]);

  // Remove item from wishlist
  const handleRemoveItem = async (productId) => {
    try {
      await dispatch(toggleWishlist(productId)).unwrap();
      toast({
        title: "Removed",
        description: "Item removed from wishlist",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  // If not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-muted/30 dark:bg-card">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <Heart className="w-20 h-20 text-pink-400 mx-auto" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Login Required
          </h1>
          
          <p className="text-muted-foreground mb-8">
            Please login to view your saved items
          </p>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-primary/100 text-white font-medium rounded-lg hover:bg-primary"
            >
              Login
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  // Empty wishlist
  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-muted/30 dark:bg-card">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <Heart className="w-24 h-24 text-gray-300 mx-auto" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Your Wishlist is Empty
          </h1>
          
          <p className="text-muted-foreground mb-8">
            Save items you like to your wishlist. They will appear here.
          </p>
          
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-primary/100 text-white font-medium rounded-lg hover:bg-primary"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 dark:bg-card">
      {/* Header */}
      <div className="bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Home size={20} />
              </button>
              <h1 className="text-2xl font-bold text-foreground">
                My Wishlist ({wishlistItems.length})
              </h1>
            </div>
            
            
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <div key={product._id} className="relative group">
              {/* Remove Button */}
              <button
                onClick={() => handleRemoveItem(product._id)}
                className="absolute top-3 right-3 z-10 w-9 h-9 bg-card rounded-full shadow-md flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Remove from wishlist"
              >
                <Heart 
                  size={18} 
                  className="text-pink-500" 
                  fill="currentColor"
                />
              </button>
              
              <ProductCard {...product} />
              
            
            </div>
          ))}
        </div>

        {/* Summary */}
        {/* <div className="mt-12 bg-card rounded-lg p-6 shadow-sm">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Your Saved Items
            </h2>
            <p className="text-muted-foreground mb-6">
              {wishlistItems.length} items in your wishlist
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => navigate('/products')}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Continue Shopping
              </button>
              
              <button
                onClick={() => {
                  // Move all to cart logic
                  toast({
                    title: "Added to cart",
                    description: "All items added to cart",
                  });
                }}
                className="px-6 py-3 bg-primary/100 text-white rounded-lg hover:bg-primary flex items-center gap-2"
              >
                <ShoppingCart size={18} />
                Add All to Cart
              </button>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default WishlistPage;