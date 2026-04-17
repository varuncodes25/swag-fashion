import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProductCard from "../custom/ProductCard";

const SimilarProducts = ({ productId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
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
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Similar Products
        </h2>
        <button 
          onClick={() => navigate("/products")}
          className="text-primary hover:text-primary/80 hover:underline transition-colors duration-200 font-medium flex items-center gap-1"
        >
          View All
          <span aria-hidden="true">→</span>
        </button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {products.slice(0, 5).map((product) => (
          <ProductCard
            key={product._id || product.id}
            _id={product._id || product.id}
            name={product.name || product.title}
            productType={product.productType || product.category}
            price={product.price || product.originalPrice}
            sellingPrice={product.sellingPrice || product.discountedPrice || product.price}
            discount={product.discount || product.discountPercentage}
            rating={product.rating || product.averageRating}
            image={product.image || product.images?.[0]}
            totalStock={product.totalStock || product.stock}
            reviewCount={product.reviewCount || product.reviews?.length}
            isNewArrival={product.isNewArrival}
            isBestSeller={product.isBestSeller}
            colors={product.colors}
            sizes={product.sizes}
          />
        ))}
      </div>
    </div>
  );
};

export default SimilarProducts;