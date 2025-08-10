import React from "react";
import { useNavigate } from "react-router-dom";

const Success = () => {
  const navigate = useNavigate();

  return (
    <div className="success-page flex flex-col items-center justify-center min-h-screen p-6">
      <div className="icon mb-4 text-green-600 text-6xl">✔️</div>
      <h1 className="text-3xl font-bold mb-2">Thank you for your purchase!</h1>
      <p className="mb-4">Your payment was successful and your order is being processed.</p>

      {/* You can fetch order details via API and show here */}

      <button
        onClick={() => navigate("/")}
        className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
      >
        Continue Shopping
      </button>
    </div>
  );
};

export default Success;
