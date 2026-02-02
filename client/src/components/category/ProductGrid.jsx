// components/category/ProductGrid.jsx
import ProductCard from "../../components/custom/ProductCard"; // Adjust path as needed

export default function ProductGrid({ loading, products }) {
  console.log("Products data:", products);

  if (loading && products.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-64 rounded-xl mb-4"></div>
            <div className="bg-gray-200 h-4 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!loading && products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-400 mb-6">
          <svg 
            className="w-20 h-20 mx-auto" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          No products found
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Try adjusting your filters or search for something else.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => {
        // // Prepare data for ProductCard
        // const productData = {
        //   _id: product._id,
        //   name: product.name || "Unnamed Product",
        //   price: product.price || 0,
        //   rating: product.rating || 0,
        //   image: product.image || null,
        //   discountedPrice: product.discountedPrice || product.price || 0,
        //   discount: product.discount || 0,
        //   offerValidTill: product.offerValidTill || null,
        //   variants: product.variants || [],
        //   brand: product.brand || "",
        //   isNewArrival: product.isNewArrival || false,
        //   reviewCount: product.reviewCount || 0,
        //   // Add other fields if needed
        // };

        return (
          <ProductCard
            key={product._id}
            {...product}
          />
        );
      })}
    </div>
  );
}