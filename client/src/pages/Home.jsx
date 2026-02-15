import FilterMenu from "@/components/custom/FilterMenu";
import Banner from "@/components/custom/banner";
import ProductList from "@/components/custom/ProductList";
import HomeCollections from "@/components/Home/HomeCollection";
import { useState } from "react";

const Home = () => {
  const [search, setSearch] = useState("");

  return (
    <div>
      <Banner />
      <HomeCollections />
      <FilterMenu onSearch={setSearch} />
      <ProductList search={search} />
    </div>
  );
};

export default Home;
