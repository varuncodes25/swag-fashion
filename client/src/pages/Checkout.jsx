import CheckoutProduct from "@/components/custom/CheckoutProduct";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import useErrorLogout from "@/hooks/use-error-logout";
import useRazorpay from "@/hooks/use-razorpay";
import { useToast } from "@/hooks/use-toast";
import { emptyCart } from "@/redux/slices/cartSlice";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Checkout = () => {
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const { cartItems, totalPrice } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { handleErrorLogout } = useErrorLogout();
  const { generatePayment, verifyPayment } = useRazorpay();

  const handleCheckout = async () => {
    if (!address.trim()) {
      return toast({
        title: "Please enter your address",
        variant: "destructive",
      });
    }

    if (cartItems.length === 0) {
      return toast({
        title: "Your cart is empty",
        variant: "destructive",
      });
    }

    // ✅ Ensure color always has a value
    const productArray = cartItems.map((item) => ({
      id: item._id,
      quantity: item.quantity,
      color: item.color || "default",
      size: item.size || null,
    }));

    try {
      if (paymentMethod === "razorpay") {
        const order = await generatePayment(totalPrice);
        await verifyPayment(order, productArray, address, navigate);

        dispatch(emptyCart());
        toast({ title: "Payment successful and order placed!" });
      } else if (paymentMethod === "cod") {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/cod-order`, // ✅ Ensure matches backend
          {
            amount: totalPrice,
            address,
            products: productArray,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (res.data.success) {
          dispatch(emptyCart());
          toast({ title: res.data.message || "Order placed with Cash on Delivery!" });
          navigate("/orders");
        } else {
          toast({ title: res.data.message || "Failed to place COD order." });
        }
      }
    } catch (error) {
      handleErrorLogout(error);
    }
  };

  return (
    <div className="mx-auto w-[90vw] sm:w-[60vw] flex justify-between items-center sm:my-20">
      <div className="flex flex-col sm:flex-row gap-5 mx-auto my-10">
        {/* Product Details */}
        <div className="space-y-8">
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-medium">Order Summary</h2>
            <div className="space-y-1 text-3xl">
              {cartItems.length === 0 ? (
                <h2 className="text-primary text-3xl">
                  Nothing To Show, Please add some products...
                </h2>
              ) : (
                cartItems.map((item) => (
                  <CheckoutProduct key={item?._id} {...item} />
                ))
              )}
            </div>
            <hr />
            <div className="p-3 rounded-md">
              <p className="flex justify-between">
                <span className="font-semibold text-customGray">Subtotal:</span>
                <span className="font-bold">₹{totalPrice}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-semibold text-customGray">Tax:</span>
                <span className="font-bold">₹0</span>
              </p>
              <p className="flex justify-between">
                <span className="font-semibold text-customGray">Shipping:</span>
                <span className="font-bold">₹0</span>
              </p>
            </div>
            <hr />
            <p className="flex justify-between px-3">
              <span className="font-bold">Total:</span>
              <span className="font-bold">₹{totalPrice}</span>
            </p>
          </div>
        </div>

        {/* Billing Information */}
        <div className="w-[90vw] sm:w-[20vw]">
          <Card className="p-4 shadow-md space-y-4">
            <h2 className="text-xl font-medium">Billing Information</h2>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input value={user?.name || ""} readOnly />

              <Label htmlFor="email">Email Address</Label>
              <Input value={user?.email || ""} readOnly />

              <Label htmlFor="address">Shipping Address</Label>
              <Textarea
                rows="7"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, City, State"
              />

              {/* Payment Method */}
              <Label>Payment Method</Label>
              <div className="flex border rounded-lg overflow-hidden">
                {["cod", "razorpay"].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`flex-1 px-4 py-2 font-medium transition-colors duration-200 ${
                      paymentMethod === method
                        ? "bg-yellow-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {method === "cod" ? "Cash on Delivery" : "Razorpay"}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleCheckout} className="w-full">
              Place Order
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
