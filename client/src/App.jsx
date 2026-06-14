import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Suspense, useEffect } from "react";
import { lazyRoute } from "./utils/lazyRoute";
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

const Home = lazyRoute(() => import("./pages/Home"));
const Signup = lazyRoute(() => import("./pages/Signup"));
const Login = lazyRoute(() => import("./pages/Login"));
const AuthCallback = lazyRoute(() => import("./pages/AuthCallback"));
const Product = lazyRoute(() => import("./pages/Product"));
const ProductReviewsPage = lazyRoute(() =>
  import("./components/Review/ProductReviewsPage")
);
const Checkout = lazyRoute(() => import("./pages/Checkout"));
const AdminLogin = lazyRoute(() => import("./pages/AdminLogin"));
const Error = lazyRoute(() => import("./pages/Error"));
const Success = lazyRoute(() => import("./pages/Success"));
const MyProfile = lazyRoute(() => import("./components/custom/MyProfile"));
const CreateProducts = lazyRoute(() =>
  import("./components/custom/CreateProducts")
);
const QuickAddProduct = lazyRoute(() =>
  import("./components/Admin/QuickAddProduct")
);
const AllProducts = lazyRoute(() => import("./components/custom/AllProducts"));
const Analytics = lazyRoute(() => import("./components/custom/Analytics"));
const Orders = lazyRoute(() => import("./components/custom/Orders"));
const AdminExchanges = lazyRoute(() =>
  import("./components/Admin/AdminExchanges")
);
const Settings = lazyRoute(() => import("./components/custom/Settings"));
const MyOrders = lazyRoute(() => import("./pages/MyOrders"));
const Contact = lazyRoute(() => import("./components/custom/Contact"));
const FaqPage = lazyRoute(() => import("./components/FaqPage"));
const AboutPage = lazyRoute(() => import("./components/AboutPage"));
const ForgotPassword = lazyRoute(() =>
  import("./components/ForgotPassword")
);
const ResetPassword = lazyRoute(() =>
  import("./components/ResetPassword")
);
const TermsAndConditions = lazyRoute(() =>
  import("./components/TermsAndConditions")
);
const PrivacyPolicy = lazyRoute(() => import("./components/PrivacyPolicy"));
const CategoryPage = lazyRoute(() => import("./pages/CategoryPage"));
const OrderDetails = lazyRoute(() => import("./components/order/OrderDetails"));
const WishlistPage = lazyRoute(() => import("./pages/Wishlist"));
const AdminProductDetails = lazyRoute(() =>
  import("./components/Admin/AdminProductDetails")
);
const BannerManager = lazyRoute(() =>
  import("./components/Admin/banner/BannerManager")
);
const TrackOrder = lazyRoute(() => import("./pages/TrackOrder"));

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
      element: (
        <ProtectedRoute>
          <AccountLayout />
        </ProtectedRoute>
      ),
      children: [{ index: true, element: <MyProfile /> }],
    },
    {
      path: "/product/:productId",
      element: <RootLayout children={<Product />} />,
    },
    {
      path: "/product/:productId/reviews",
      element: <RootLayout children={<ProductReviewsPage />} />,
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
      path: "/track-order",
      element: <RootLayout children={<TrackOrder />} />,
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
      path: "/terms",
      element: <RootLayout children={<TermsAndConditions />} />,
    },
    {
      path: "/privacy-policy",
      element: <RootLayout children={<PrivacyPolicy />} />,
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
      path: "/admin/dashboard/quick-add",
      element: (
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout children={<QuickAddProduct />} />
        </ProtectedRoute>
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
      path: "/admin/banner",
      element: (
        <Suspense fallback={<RoutePageFallback />}>
          <BannerManager />
        </Suspense>
      ),
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
      path: "/admin/dashboard/exchanges",
      element: (
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout children={<AdminExchanges />} />
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
      element: (
        <Suspense fallback={<RoutePageFallback />}>
          <Error />
        </Suspense>
      ),
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
