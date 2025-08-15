import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "../ui/input";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setProducts } from "@/redux/slices/productSlice";

// Category dropdown data
const categoryData = {
  trigger: "Category",
  items: [
    { label: "All Categories", value: "all" },
    { label: "Men", value: "Men" },
    { label: "Women", value: "Women" },
    { label: "Kid", value: "Kid" },
    { label: "Men & Women", value: "Men & Women" },
  ],
};

// Price dropdown data
const priceData = {
  trigger: "Price",
  items: [
    { label: "Less than 199", value: 199 },
    { label: "Less than 249", value: 249 },
    { label: "Less than 349", value: 349 },
    { label: "Less than 499", value: 499 },
  ],
};

const FilterMenu = () => {
  const [category, setCategory] = useState("all"); // Default to "all"
  const [price, setPrice] = useState("");
  const [search, setSearch] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    const getFilterProducts = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/get-products`,
          {
            params: {
              category,
              price,
              search,
            },
          }
        );

        const data = res.data.data || [];

        // ✅ Filter unique products by name
        const uniqueByName = [];
        const nameSet = new Set();

        for (const product of data) {
          if (!nameSet.has(product.name)) {
            nameSet.add(product.name);
            uniqueByName.push(product);
          }
        }

        dispatch(setProducts(uniqueByName));
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    getFilterProducts();
  }, [category, price, search, dispatch]);

  return (
    <div className="w-[93vw] flex flex-col sm:flex-row justify-between items-center mx-auto my-10 gap-3 sm:gap-0">
      {/* DROPDOWN FILTERS */}
      <div className="flex sm:w-[30%] w-full gap-3">
        {/* FOR CATEGORY */}
        <Select onValueChange={(value) => setCategory(value)}>
          <SelectTrigger id={categoryData.trigger}>
            <SelectValue placeholder={categoryData.trigger} />
          </SelectTrigger>
          <SelectContent position="popper">
            {categoryData.items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* FOR PRICE */}
        <Select onValueChange={(value) => setPrice(value)}>
          <SelectTrigger id={priceData.trigger}>
            <SelectValue placeholder={priceData.trigger} />
          </SelectTrigger>
          <SelectContent position="popper">
            {priceData.items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* SEARCH INPUT */}
      <div className="sm:w-[60%] w-full">
        <Input
          id="search"
          placeholder="Search Here..."
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    </div>
  );
};

export default FilterMenu;
