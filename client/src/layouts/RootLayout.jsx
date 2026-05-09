import { Suspense } from "react";
import Navbar from "../components/custom/Navbar";
import Footer from "../components/custom/Footer";
import ScrollToTop from "../components/ScrollToTop";
import RoutePageFallback from "../components/RoutePageFallback";

const RootLayout = ({ children }) => {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Suspense fallback={<RoutePageFallback />}>{children}</Suspense>
      </main>
      <Footer />
    </>
  );
};

export default RootLayout;
