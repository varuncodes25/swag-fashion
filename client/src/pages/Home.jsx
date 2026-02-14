import FilterMenu from "@/components/custom/FilterMenu";
import Banner from "@/components/custom/Banner";
import ProductList from "@/components/custom/ProductList";
import HomeCollections from "@/components/Home/HomeCollection";

const Home = () => {
  return (
    <div>
      <Banner />
      <HomeCollections />
      <FilterMenu />
      <ProductList />
    </div>
  );
};

export default Home;