import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SimilarProducts = ({ productId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        // You can modify this API call based on your backend
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/similar-products/${productId}`
        );
        setProducts(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch similar products:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchSimilarProducts();
    }
  }, [productId]);

  if (loading || products.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Similar Products</h2>
        <button className="text-primary hover:underline">View All</button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.slice(0, 5).map((product) => (
          <div
            key={product._id}
            className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/product/${product.slug}`)}
          >
            <img
              src={product.image?.url}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-3">
              <h3 className="font-medium text-sm line-clamp-2 mb-2">
                {product.name}
              </h3>
              <div className="flex items-center justify-between">
                <span className="font-bold">₹{product.price}</span>
                {product.discount > 0 && (
                  <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                    {product.discount}% OFF
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarProducts;