import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";

import { useDispatch } from "react-redux";
import { setProducts as setReduxProducts } from "@/redux/slices/productSlice";
import Pagination from "./Pagination";

const ProductList = ({
  category,
  subCategory,
  price,
  discount,
  search,
}) => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const limit = 12;

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/get-products`,
        {
          params: {
            page,
            limit,

            // ✅ category & subcategory
            category: category || "",
            subCategory: subCategory || "",

            // ✅ filters
            minPrice: price?.min || "",
            maxPrice: price?.max || "",
            discount: discount || "",

            // ✅ search
            search: search || "",
          },
        }
      );

      const { data = [], pagination } = res.data;

      setProducts(Array.isArray(data) ? data : []);
      dispatch(setReduxProducts(data));

      const total = pagination?.totalProducts ?? 0;
      setTotalPages(Math.ceil(total / limit));
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1); // reset page on filter change
  }, [category, subCategory, price, discount, search]);

  useEffect(() => {
    fetchProducts();
  }, [page, category, subCategory, price, discount, search]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto grid gap-5 grid-cols-[repeat(auto-fill,minmax(160px,1fr))] px-4 py-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="border shadow rounded-xl p-3 animate-pulse"
          >
            <div className="bg-gray-300 h-32 rounded mb-4" />
            <div className="h-4 bg-gray-300 w-3/4 mb-2 rounded" />
            <div className="h-3 bg-gray-200 w-1/2 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {products.length > 0 ? (
        <div className="w-[93vw] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mx-auto gap-4 my-10">
          {products.map((p) => (
            <ProductCard key={p._id} {...p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          No products found
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center py-6">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </>
  );
};

export default ProductList;
