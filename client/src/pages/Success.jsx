import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Success = () => {
  const [count, setCount] = useState(3);
  const navigate = useNavigate();

  useEffect(() => {
    if (count === 0) {
      navigate("/");
      return; // stop running the effect after redirect
    }

    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);

    // Cleanup timeout if component unmounts or count changes
    return () => clearTimeout(timer);
  }, [count, navigate]);

  return (
    <div className="flex flex-col justify-center items-center w-screen h-screen">
      <h1 className="text-3xl sm:text-4xl font-bold">Payment Successful</h1>
      <Link to="/" className="text-xs sm:text-base">
        Go to Home ( Redirecting you in {count} second{count !== 1 ? "s" : ""} )
      </Link>
    </div>
  );
};

export default Success;
