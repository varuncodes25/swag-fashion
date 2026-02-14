import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import { ThemeProvider } from "./components/provider/theme-provider";
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
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import TermsAndConditions from "./components/TermsAndConditions";
import CategoryPage from "./pages/CategoryPage";
import OrderDetails from "./components/order/OrderDetails";
import WishlistPage from "./pages/Wishlist";

export default function App() {
  const router = createBrowserRouter([
    // ============ PUBLIC ROUTES ============
    {
      path: "/",
      element: <RootLayout children={<Home />} />,
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
      path: "/contact",
      element: <RootLayout children={<Contact />} />,
    },
    {
      path: "/faq",
      element: <RootLayout children={<FaqPage />} />,
    },
    {
      path: "/about",
      element: <RootLayout children={<AboutPage />} />,
    },
    {
      path: "/termsandconditions",
      element: <RootLayout children={<TermsAndConditions />} />,
    },
    {
      path: "/success",
      element: <RootLayout children={<Success />} />,
    },

    // ============ AUTH ROUTES (redirect if logged in) ============
    {
      path: "/login",
      element: (
        <ProtectedRoute requireAuth={false}>
          <RootLayout children={<Login />} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/signup",
      element: (
        <ProtectedRoute requireAuth={false}>
          <RootLayout children={<Signup />} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/forgot-password",
      element: (
        <ProtectedRoute requireAuth={false}>
          <RootLayout children={<ForgotPassword />} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/reset-password/:token",
      element: (
        <ProtectedRoute requireAuth={false}>
          <RootLayout children={<ResetPassword />} />
        </ProtectedRoute>
      ),
    },

    // ============ USER PROTECTED ROUTES ============
    {
      path: "/checkout",
      element: (
        <ProtectedRoute>
          <RootLayout children={<Checkout />} />
        </ProtectedRoute>
      ),
    },
    {
      path: "account/wishlist",
      element: (
        <ProtectedRoute>
          <RootLayout children={<WishlistPage />} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/orders/:orderId",
      element: (
        <ProtectedRoute>
          <RootLayout children={<OrderDetails />} />
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

    // ============ ADMIN ROUTES ============
    {
      path: "/admin/login",
      element: (
        // <ProtectedRoute requireAdmin={false}>
          <RootLayout children={<AdminLogin />} />
        // </ProtectedRoute>
      ),
    },
    {
      path: "/admin/dashboard",
      element: (
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout children={<CreateProducts />} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/dashboard/all-products",
      element: (
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout children={<AllProducts />} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/dashboard/analytics",
      element: (
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout children={<Analytics />} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/dashboard/orders",
      element: (
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout children={<Orders />} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/dashboard/settings",
      element: (
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout children={<Settings />} />
        </ProtectedRoute>
      ),
    },

    // ============ 404 ROUTE ============
    {
      path: "/*",
      element: <Error />,
    },
  ]);

  return (
    <ThemeProvider>
      <Provider store={store}>
        <Toaster />
        <RouterProvider router={router} />
      </Provider>
    </ThemeProvider>
  );
}