// components/category/ProductGrid.jsx
export default function ProductGrid({ loading, products }) {
  console.log(products,"sssss")
  if (loading && products.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-64 rounded-lg mb-2"></div>
            <div className="bg-gray-200 h-4 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  // if (!loading && products.length === 0) {
  //   return (
  //     <div className="text-center py-12">
  //       <div className="text-gray-400 mb-4">
  //         <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  //         </svg>
  //       </div>
  //       <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
  //       <p className="text-gray-500">Try adjusting your filters or check back later.</p>
  //     </div>
  //   );
  // }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product._id} className="group cursor-pointer">
          {/* Product Image Container */}
          <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square mb-3">
            <img
              src={product.image?.url}
              alt={product.name}
              className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x300';
              }}
            />
            
            {/* Discount Badge */}
            {product.discount > 0 && (
              <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                {product.discount}% OFF
              </div>
            )}
            
            {/* New Arrival Badge */}
            {product.isNewArrival && (
              <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                NEW
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h3 className="text-sm text-gray-700 line-clamp-1">{product.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{product.brand}</p>
            
            <div className="flex items-center mt-2">
              <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
              {product.discount > 0 && (
                <span className="ml-2 text-sm text-gray-500 line-through">
                  ₹{Math.round(product.price / (1 - product.discount/100))}
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center mt-1">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-4 h-4 ${star <= product.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="ml-1 text-sm text-gray-600">({product.reviewCount})</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}