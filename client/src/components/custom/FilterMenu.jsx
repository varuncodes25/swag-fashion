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

const categoryData = {
  trigger: "Category",
  items: ["All Categories","Men", "Women", "Kid","Men & Women"],
};

const priceData = {
  trigger: "Price",
  items: [199, 249, 349, 499],
};

const FilterMenu = () => {
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [search, setSearch] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
  const getFilterProducts = async () => {
    const res = await axios.get(
      import.meta.env.VITE_API_URL +
        `/get-products?category=${category}&price=${price}&search=${search}`
    );
    const data = res.data.data;

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
  };

  getFilterProducts();
}, [category, price, search]);

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
              <SelectItem key={item} value={item} className="capitalize">
                {item}
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
              <SelectItem key={item} value={item} className="capitalize">
                Less than {item}
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
