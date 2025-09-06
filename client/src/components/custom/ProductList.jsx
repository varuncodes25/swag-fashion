import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { useSelector } from "react-redux";

const ProductList = () => {
  const { products } = useSelector((state) => state.product);
  console.log("new product", products);
  
  const isLoading = !Array.isArray(products) || products.length === 0;

  return (
    <>
      {isLoading && (
        <div className="w-[93vw] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mx-auto my-10">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg shadow animate-pulse p-4">
              <div className="bg-gray-300 h-32 rounded-md mb-4"></div> {/* image placeholder */}
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>    {/* title placeholder */}
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>          {/* price placeholder */}
            </div>
          ))}
        </div>
      )}

      {!isLoading && (
        <div className="w-[93vw] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mx-auto gap-4 place-content-center my-10">
          {Array.isArray(products) &&
            products.map((product) => (
              <ProductCard key={product._id} {...product} />
            ))}
        </div>
      )}
    </>
  );
};

export default ProductList;
