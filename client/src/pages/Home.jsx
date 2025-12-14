import FilterMenu from "@/components/custom/FilterMenu";
import HeaderDisplay from "@/components/custom/HeaderDisplay";
import ProductList from "@/components/custom/ProductList";
import HomeCollections from "@/components/Home/HomeCollection";
import React from "react";

const Home = () => {


  return (
    <div>
      <HeaderDisplay />
        <HomeCollections/>
      <FilterMenu />
      <ProductList/>

    </div>
  );
};

export default Home;
