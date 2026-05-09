import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { ThemeProvider } from "./components/provider/theme-provider";
import RootLayout from "./layouts/RootLayout";
import AdminLayout from "./layouts/AdminLayout";
import { Provider, useDispatch } from "react-redux";
import { store } from "./redux/store";
import { Toaster } from "./components/ui/toaster";
import ProtectedRoute from "./components/custom/ProtectedRoute";
import { setUserLogout } from "./redux/slices/authSlice";
import AccountLayout from "./layouts/AccountLayout";
import RoutePageFallback from "./components/RoutePageFallback";

const Home = lazy(() => import("./pages/Home"));
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Product = lazy(() => import("./pages/Product"));
const Checkout = lazy(() => import("./pages/Checkout"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Error = lazy(() => import("./pages/Error"));
const Success = lazy(() => import("./pages/Success"));
const MyProfile = lazy(() => import("./components/custom/MyProfile"));
const CreateProducts = lazy(() => import("./components/custom/CreateProducts"));
const AllProducts = lazy(() => import("./components/custom/AllProducts"));
const Analytics = lazy(() => import("./components/custom/Analytics"));
const Orders = lazy(() => import("./components/custom/Orders"));
const Settings = lazy(() => import("./components/custom/Settings"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const Contact = lazy(() => import("./components/custom/Contact"));
const FaqPage = lazy(() => import("./components/FaqPage"));
const AboutPage = lazy(() => import("./components/AboutPage"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));
const ResetPassword = lazy(() => import("./components/ResetPassword"));
const TermsAndConditions = lazy(() =>
  import("./components/TermsAndConditions")
);
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const OrderDetails = lazy(() => import("./components/order/OrderDetails"));
const WishlistPage = lazy(() => import("./pages/Wishlist"));
const AdminProductDetails = lazy(() =>
  import("./components/Admin/AdminProductDetails")
);
const BannerManager = lazy(() =>
  import("./components/Admin/banner/BannerManager")
);

export default function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    const handleLogout = () => {
      dispatch(setUserLogout());
    };

    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, [dispatch]);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout children={<Home />} />,
    },
    {
      path: "account",
      element: <AccountLayout />,
      children: [{ index: true, element: <MyProfile /> }],
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
    {
      path: "/auth/callback",
      element: (
        <ProtectedRoute requireAuth={false}>
          <RootLayout children={<AuthCallback />} />
        </ProtectedRoute>
      ),
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
    {
      path: "/admin/login",
      element: <RootLayout children={<AdminLogin />} />,
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
      path: "/admin/banner",
      element: <BannerManager />,
    },
    {
      path: "/admin/dashboard/edit-product/:productId",
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
      path: "/admin/products/:productId",
      element: (
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout children={<AdminProductDetails />} />
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
    {
      path: "/*",
      element: <Error />,
    },
  ]);

  return (
    <ThemeProvider>
      <Provider store={store}>
        <Toaster />
        <Suspense fallback={<RoutePageFallback />}>
          <RouterProvider router={router} />
        </Suspense>
      </Provider>
    </ThemeProvider>
  );
}
