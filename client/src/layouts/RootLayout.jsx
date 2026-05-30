import { Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/custom/Navbar";
import Footer from "../components/custom/Footer";
import ScrollToTop from "../components/ScrollToTop";
import RoutePageFallback from "../components/RoutePageFallback";
import { applySeoMeta } from "@/utils/seo";
import { NOINDEX_ROBOTS, pathShouldNoIndex } from "@/hooks/useNoIndexPage";

const RootLayout = ({ children }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathShouldNoIndex(pathname)) {
      applySeoMeta({ robots: NOINDEX_ROBOTS });
    }
  }, [pathname]);

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
