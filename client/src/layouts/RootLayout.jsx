import Navbar from "../components/custom/Navbar";
import Footer from "../components/custom/Footer";
import ScrollToTop from "../components/ScrollToTop";

const RootLayout = ({ children }) => {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default RootLayout;
