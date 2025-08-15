import OrderData from "@/components/custom/OrderData";
import useErrorLogout from "@/hooks/use-error-logout";
import axios from "axios";
import React, { useEffect, useState } from "react";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const { handleErrorLogout } = useErrorLogout();

  useEffect(() => {
    const getMyOrders = async () => {
      try {
        const res = await axios.get(
          import.meta.env.VITE_API_URL + "/get-orders-by-user-id",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const { data } = res.data;
        setOrders(data);
      } catch (error) {
        console.log(error);
        return handleErrorLogout(error);
      }
    };

    getMyOrders();
  }, []);
console.log("First Order ID:", orders);
  const handleCancelOrder = async (orderId) => {
    console.log("Canceling order:", orderId);
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      await axios.post(
        import.meta.env.VITE_API_URL + "/cancel-order",
        { orderId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setOrders((prev) => prev.filter((order) => order._id !== orderId));
      alert("Order canceled successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to cancel order");
    }
  };

  return (
    <div className="w-[90vw] lg:w-[50vw] mx-auto my-10 sm:my-32 grid gap-3">
      <h1 className="text-2xl font-bold">My Orders</h1>
      <div className="grid gap-3">
        {orders.length === 0 ? (
          <h1>No Orders to show</h1>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="border p-4 rounded-lg shadow-sm bg-white dark:bg-zinc-800"
            >
              <OrderData
                {...order}
                onCancel={() => handleCancelOrder(order._id)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyOrders;
