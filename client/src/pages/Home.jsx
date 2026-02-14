// Home.jsx - CORRECT VERSION
import FilterMenu from "@/components/custom/FilterMenu";
import Banner from "@/components/custom/Banner";  // Changed this line
import ProductList from "@/components/custom/ProductList";
import React, { useState } from "react";
import HomeCollections from "@/components/Home/HomeCollection";

const Home = () => {
  return (
    <div>
      <Banner />  {/* Changed this line */}
      <HomeCollections/>

      <FilterMenu />
      <ProductList/>
    </div>
  );
};

export default Home;