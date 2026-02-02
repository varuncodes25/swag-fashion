import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// import { emptyCart } from "@/redux/slices/cartSlice";
import useErrorLogout from "@/hooks/use-error-logout";
import useRazorpay from "@/hooks/use-razorpay";
import { useToast } from "@/hooks/use-toast";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { handleErrorLogout } = useErrorLogout();
  const { generatePayment, verifyPayment } = useRazorpay();

  const { cartItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  // Use products from state (if navigating from Product page) or cart
  const stateProducts = location.state?.products || [];
  const products = stateProducts.length > 0 ? stateProducts : cartItems;

  const computedTotal =
    products.length > 0
      ? products.reduce((sum, p) => sum + (p.price || 0) * (p.quantity || 1), 0)
      : 0;

  const [address, setAddress] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    street: user?.address || "",
    city: user?.city || "",
    state: user?.state || "",
    zip: user?.zip || "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");

  const handlePlaceOrder = async () => {
    const requiredFields = ["name", "email", "phone", "street", "city", "state", "zip"];
    for (let field of requiredFields) {
      if (!address[field]?.trim()) {
        return toast({ title: `Please fill ${field}`, variant: "destructive" });
      }
    }

    if (!paymentMethod) {
      return toast({ title: "Select a payment method", variant: "destructive" });
    }

    if (products.length === 0) {
      return toast({ title: "No products to checkout", variant: "destructive" });
    }

    try {
      const orderProducts = products.map((item) => ({
        id: item.productId || item.id || item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        color: item.color || "",
        size: item.size || "",
        image: item.image || "/fallback.png",
      }));

      if (paymentMethod === "razorpay") {
        const amountInPaise = computedTotal * 100;
        const order = await generatePayment(amountInPaise);

        await verifyPayment(order, orderProducts, address, navigate);

        // if (!stateProducts.length) dispatch(emptyCart());
        toast({ title: "Payment successful and order placed!" });
        navigate("/my-orders");
      } else if (paymentMethod === "cod") {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/cod-order`,
          { amount: computedTotal, address, products: orderProducts, paymentMode: "cod" },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        if (res.data.success) {
          // if (!stateProducts.length) dispatch(emptyCart());
          toast({ title: "Order placed with Cash on Delivery!" });
          navigate("/my-orders");
        } else {
          toast({ title: res.data.message || "Failed to place COD order", variant: "destructive" });
        }
      }
    } catch (error) {
      handleErrorLogout(error);
    }
  };

  return (
    <div className="mx-auto w-[95vw] lg:w-[80vw] flex flex-col sm:flex-row gap-6 my-10">
      {/* Product Summary */}
      <div className="flex-1 space-y-6">
        <Card className="p-4 shadow-md space-y-4">
          <h2 className="text-xl font-semibold">Order Summary</h2>
          <div className="space-y-3">
            {products.length === 0 ? (
              <p className="text-red-500 text-lg">Nothing to show. Please add some products!</p>
            ) : (
              products.map((item) => (
                <div
                  key={item.productId || item.id || item._id}
                  className="flex justify-between items-center border rounded-md p-2"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image || "/fallback.png"}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p>Qty: {item.quantity}</p>
                      {item.color && <p>Color: {item.color}</p>}
                      {item.size && <p>Size: {item.size}</p>}
                    </div>
                  </div>
                  <p className="font-bold">₹{(item.price || 0) * (item.quantity || 1)}</p>
                </div>
              ))
            )}
          </div>

          <hr />
          <div className="p-3 rounded-md space-y-1">
            <p className="flex justify-between">
              <span className="font-semibold">Subtotal:</span>
              <span>₹{computedTotal}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-semibold">Tax:</span>
              <span>₹0</span>
            </p>
            <p className="flex justify-between">
              <span className="font-semibold">Shipping:</span>
              <span>₹0</span>
            </p>
          </div>

          <hr />
          <p className="flex justify-between font-bold px-3">
            <span>Total:</span>
            <span>₹{computedTotal}</span>
          </p>
        </Card>
      </div>

      {/* Billing Info & Payment */}
      <div className="w-full sm:w-[350px]">
        <Card className="p-4 shadow-md space-y-4">
          <h2 className="text-xl font-semibold">Billing Information</h2>
          <div className="space-y-2">
            {["name", "email", "phone", "street", "city", "state", "zip"].map((field) => (
              <div key={field}>
                <Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                {field === "street" ? (
                  <Textarea
                    rows={4}
                    value={address[field]}
                    onChange={(e) => setAddress({ ...address, [field]: e.target.value })}
                    placeholder={`Enter ${field}`}
                  />
                ) : (
                  <Input
                    value={address[field]}
                    onChange={(e) => setAddress({ ...address, [field]: e.target.value })}
                    placeholder={`Enter ${field}`}
                  />
                )}
              </div>
            ))}

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
                  {method === "cod" ? "Cash on Delivery" : "Online"}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handlePlaceOrder}
            className="w-full mt-4"
            disabled={products.length === 0}
          >
            Confirm Order
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;
