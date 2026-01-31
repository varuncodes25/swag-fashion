  import { createBrowserRouter, RouterProvider } from "react-router-dom";
  import Home from "./pages/Home";
  import Navbar from "./components/custom/Navbar";
  import { ThemeProvider } from "./components/provider/theme-provider";
  import Footer from "./components/custom/Footer";
  import Signup from "./pages/Signup";
  import Login from "./pages/Login";
  import Product from "./pages/Product";
  import Checkout from "./pages/Checkout";
  import AdminLogin from "./pages/AdminLogin";
  import Error from "./pages/Error";
  import Success from "./pages/Success";
  import RootLayout from "./layouts/RootLayout";
  import AdminLayout from "./layouts/AdminLayout";
  import CreateProducts from "./components/custom/CreateProducts";
  import AllProducts from "./components/custom/AllProducts";
  import Analytics from "./components/custom/Analytics";
  import Orders from "./components/custom/Orders";
  import Settings from "./components/custom/Settings";
  import { Provider } from "react-redux";
  import { store } from "./redux/store";
  import MyOrders from "./pages/MyOrders";
  import { Toaster } from "./components/ui/toaster";
  import ProtectedRoute from "./components/custom/ProtectedRoute";
  import Contact from "./components/custom/Contact";
  import FaqPage from "./components/FaqPage";
  import AboutPage from "./components/AboutPage";
  import ScrollToTop from "./components/ScrollToTop";
  import ForgotPassword from "./components/ForgotPassword";
  import ResetPassword from "./components/ResetPassword";
  import TermsAndConditions from "./components/TermsAndConditions";
import CategoryPage from "./pages/CategoryPage";



  export default function App() {
    const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <RootLayout children={<Home />} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/signup",
      element: (
        <ProtectedRoute>
          <RootLayout children={<Signup />} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/login",
      element: (
        <ProtectedRoute>
          <RootLayout children={<Login />} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/product/:productId",
      element: <RootLayout children={<Product />} />,
    },
     {
      path: "/category/:slug",
      element: <RootLayout children={<CategoryPage />} />,
    },
   {
      path: "/category/:slug/:subSlug",
      element: <RootLayout children={<CategoryPage />} />,
    },
    
    {
      path: "/checkout",
      element: (
        <ProtectedRoute>
          <RootLayout children={<Checkout />} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/forgot-password",
      element: (
        <ProtectedRoute>
          <RootLayout children={<ForgotPassword />} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/reset-password/:token",
      element: (
        <ProtectedRoute>
          <RootLayout children={<ResetPassword />} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/contact",
      element: (
        <ProtectedRoute>
          <RootLayout children={<Contact />} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/faq",
      element: (
        <ProtectedRoute>
          <RootLayout children={<FaqPage />} />
        </ProtectedRoute>
      ),
    },
    {
  path: "/termsandconditions",
  element: (
    <ProtectedRoute>
      <RootLayout children={<TermsAndConditions />} />
    </ProtectedRoute>
  ),
},

    {
      path: "/success",
      element: <RootLayout children={<Success />} />,
    },
    {
      path: "/about",
      element: (
        <ProtectedRoute>
          <RootLayout children={<AboutPage />} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/orders",
      element: (
        <ProtectedRoute>
          <RootLayout children={<MyOrders />} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/login",
      element: (
        <ProtectedRoute>
          <RootLayout children={<AdminLogin />} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/dashboard",
      element: (
        <ProtectedRoute>
          <AdminLayout children={<CreateProducts />} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/dashboard/all-products",
      element: (
        <ProtectedRoute>
          <AdminLayout children={<AllProducts />} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/dashboard/analytics",
      element: (
        <ProtectedRoute>
          <AdminLayout children={<Analytics />} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/dashboard/orders",
      element: (
        <ProtectedRoute>
          <AdminLayout children={<Orders />} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/teamsandconditions",
      element: (
        <ProtectedRoute>
          <RootLayout children={<teamsandconditions />} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/dashboard/settings",
      element: (
        <ProtectedRoute>
          <AdminLayout children={<Settings />} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/*",
      element: <Error />,
    },
  ]);



    return (
      <>
      
        <ThemeProvider>
          <Provider store={store}>
            <Toaster />
            {/* 👇 Now ScrollToTop is inside RouterProvider */}
            <RouterProvider
              router={router}
              fallbackElement={<div>Loading...</div>}
            >
              <ScrollToTop />
            </RouterProvider>
          </Provider>
        </ThemeProvider>
        

      </>
    );
  }
