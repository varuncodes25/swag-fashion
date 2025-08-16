import React from "react";
import ProductCard from "./ProductCard";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

const ProductList = () => {
  const { products } = useSelector((state) => state.product);
  console.log("new product", products);

  const isLoading = !Array.isArray(products) || products.length === 0;

  return (
    <>
      {isLoading && (
        <div className="flex justify-center items-center my-10">
          <Loader2 className="anima
          
          
            te-spin" size={30} />
        </div>
      )}

      <div className="w-[93vw] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mx-auto gap-4 place-content-center my-10">
        {Array.isArray(products) &&
          products.map((product) => (
            <ProductCard key={product._id} {...product} />
          ))}
      </div>
    </>
  );
};

export default ProductList;
