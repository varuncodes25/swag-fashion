import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, ShoppingBag, Home } from "lucide-react";

const Success = () => {
  const [count, setCount] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    if (count === 0) {
      navigate("/");
      return;
    }

    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-muted/40 to-background px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-lg sm:p-8">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-success to-success/80 shadow-md shadow-success/20 sm:h-20 sm:w-20">
          <CheckCircle className="h-8 w-8 text-white sm:h-10 sm:w-10" />
        </div>

        <h1 className="text-xl font-bold text-foreground sm:text-2xl">
          Payment Successful
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Thank you for your order. Your payment has been confirmed.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/orders" className="btn-premium w-full sm:w-auto">
            <ShoppingBag className="h-4 w-4" />
            View Orders
          </Link>
          <Link to="/" className="btn-premium-outline w-full sm:w-auto">
            <Home className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>

        <p className="mt-5 text-xs text-muted-foreground">
          Redirecting to home in {count} second{count !== 1 ? "s" : ""}…
        </p>
      </div>
    </div>
  );
};

export default Success;
