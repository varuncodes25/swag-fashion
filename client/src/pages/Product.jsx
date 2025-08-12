import ReviewsComponent from "@/components/custom/ReviewsComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Colors } from "@/constants/colors";
import { starsGenerator } from "@/constants/helper";
import useRazorpay from "@/hooks/use-razorpay";
import { useToast } from "@/hooks/use-toast";
import { addToCart } from "@/redux/slices/cartSlice";
import axios from "axios";
import { Circle, Minus, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

const imagesArray = [
  {
    url: "https://images.pexels.com/photos/532173/pexels-photo-532173.jpeg?auto=compress&cs=tinysrgb&w=600",
    id: 1,
  },
  {
    url: "https://images.pexels.com/photos/532173/pexels-photo-532173.jpeg?auto=compress&cs=tinysrgb&w=600",
    id: 2,
  },
  {
    url: "https://images.pexels.com/photos/532173/pexels-photo-532173.jpeg?auto=compress&cs=tinysrgb&w=600",
    id: 3,
  },
  {
    url: "https://images.pexels.com/photos/532173/pexels-photo-532173.jpeg?auto=compress&cs=tinysrgb&w=600",
    id: 4,
  },
];

const productStock = 5;

const Product = () => {
  const { productName } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { verifyPayment, generatePayment } = useRazorpay();

  const [productQuantity, setProductQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [purchaseProduct, setPurchaseProduct] = useState(false);
  const [address, setAddress] = useState("");
  const [product, setProduct] = useState({});
  const [selectedImage, setSelectedImage] = useState(0);
  const [productColor, setProductColor] = useState("");
  const [productSize, setProductSize] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(""); // "razorpay" or "cod"

  useEffect(() => {
    const fetchProductByName = async () => {
      try {
        const res = await axios.get(
          import.meta.env.VITE_API_URL +
            `/get-product-by-name/${productName?.split("-").join(" ")}`
        );
        const { data } = await res.data;
        console.log(data);
        setProduct(data);
      } catch (error) {}
    };

    fetchProductByName();
  }, [productName]);
  useEffect(() => {
    console.log("paymentMethod changed:", paymentMethod);
  }, [paymentMethod]);
  const calculateEmi = (price) => Math.round(price / 6);

  const checkAvailability = async () => {
    if (pincode.trim() === "") {
      setAvailabilityMessage("Please enter a valid pincode");
      return;
    }
    const res = await axios.get(
      import.meta.env.VITE_API_URL + `/get-pincode/${pincode}`
    );
    const data = await res.data;
    setAvailabilityMessage(data.message);
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (productColor == "") {
      toast({
        title: "Please select a color",
      });
      return;
    }

    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        quantity: productQuantity,
        image: product.images[0].url,
        color: productColor,
        stock: product.stock,
        blacklisted: product.blacklisted,
        size: product.size,
      })
    );

    setProductQuantity(1);
    toast({
      title: "Product added to cart",
    });
  };

  const handleBuyNow = async () => {
  if (!isAuthenticated) {
    navigate("/login");
    return;
  }

  if (productQuantity > product.stock) {
    toast({ title: "Product out of stock" });
    return;
  }

  if (product.blacklisted) {
    toast({ title: "Product isn't available for purchase" });
    return;
  }

  if (productColor === "") {
    toast({ title: "Please select a color" });
    return;
  }

  if (!address.trim()) {
    toast({ title: "Please enter your address" });
    return;
  }

  if (!paymentMethod) {
    toast({ title: "Please select a payment method" });
    return;
  }

  // Total price in rupees
  console.log(product.discountedPrice,"fhgfhgfhgfhghgv")
   console.log(product,"fhgfhgfhgfhghgv")
  const totalAmount = product.discountedPrice * productQuantity;
  console.log(totalAmount,"tottttttt")
  if (paymentMethod === "razorpay") {
    try {
      // Razorpay ke liye paise me convert
      const amountInPaise = totalAmount * 100;

      // Backend se order generate
      const order = await generatePayment(amountInPaise);
      console.log("Order details:", order);

      await verifyPayment(
        {
          ...order,
          amount: order.amount || amountInPaise, // Razorpay expects paise
        },
        [{ id: product._id, quantity: productQuantity, color: productColor }],
        address,
        navigate
      );
    } catch (error) {
      console.error("Razorpay payment failed:", error);
      toast({ title: "Payment failed. Please try again." });
    }
  } 
  
  else if (paymentMethod === "cod") {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/cod-order`,
        {
          amount: totalAmount, // COD me paise me nahi, rupees me hi store karo
          address,
          products: [
            {
              id: product._id,
              quantity: productQuantity,
              color: productColor,
              size: productSize,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        toast({ title: "Order placed with Cash on Delivery!" });
      } else {
        toast({ title: res.data.message || "Failed to place COD order." });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Something went wrong. Please try again." });
    }
  }

  // Reset states
  setPurchaseProduct(false);
  setPaymentMethod("");
};


  return (
    <>
      <div>
        <main className="w-[100vw] lg:w-[72vw] flex flex-col sm:flex-row justify-start items-start gap-10 mx-auto my-10">
          {/* LEFT SIDE */}
          <div className="grid sm:w-[45%] gap-3 ">
            <img
              src={product?.images?.[selectedImage]?.url}
              className="w-full lg:h-[35rem] rounded-xl object-center object-cover border dark:border-none"
            />
            <div className="grid grid-cols-4 gap-3 ">
              {product?.images?.map(({ url, id }, index) => (
                <img
                  src={url}
                  key={id}
                  onClick={() => setSelectedImage(index)}
                  className="rounded-xl filter hover:brightness-50 cursor-pointer transition-all ease-in-out duration-300 border dark:border-none"
                />
              ))}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="sm:w-[50%] lg:w-[35%]">
            <div className="pb-5">
              <h2 className="font-extrabold text-2xl">{product?.name}</h2>
              <p className="text-sm my-2">{product?.description}</p>
              <div className="flex items-center">
                {starsGenerator(product.rating, "0", 15)}
                <span className="text-md ml-1">
                  ({product?.reviews?.length})
                </span>
              </div>
            </div>

            <div className="py-5 border-b">
              <h3 className="font-bold text-lg text-white">Choose Size</h3>
              <div className="flex items-center gap-3 my-3">
                {["S", "M", "L", "XL"].map((size) => (
                  <button
                    key={size}
                    onClick={() => setProductSize(size)}
                    className={`px-4 py-2 border rounded-md text-sm font-medium transition-all
          ${
            productSize === size
              ? "border-orange-500 bg-orange-100 text-orange-700 shadow-md"
              : "border-gray-300 bg-white text-black hover:border-black"
          }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="py-5 border-b">
              <h3 className="font-bold text-lg">Choose Color</h3>
              <div className="flex items-center my-2">
                {product?.colors?.map((color, index) => (
                  <Circle
                    key={index + color}
                    fill={color}
                    strokeOpacity={0.2}
                    strokeWidth={0.2}
                    size={40}
                    onClick={() => setProductColor(color)}
                    className="cursor-pointer filter hover:brightness-50"
                  />
                ))}
              </div>
            </div>

            <div className="py-5">
              <div className="flex gap-3 items-center">
                <div className="flex items-center gap-5 bg-gray-100 rounded-full px-3 py-2 w-fit">
                  <Minus
                    stroke={Colors.customGray}
                    cursor={"pointer"}
                    onClick={() =>
                      setProductQuantity((qty) => (qty > 1 ? qty - 1 : 1))
                    }
                  />
                  <span className="text-slate-950">{productQuantity}</span>
                  <Plus
                    stroke={Colors.customGray}
                    cursor={"pointer"}
                    onClick={() =>
                      setProductQuantity((qty) =>
                        qty < productStock ? qty + 1 : qty
                      )
                    }
                  />
                </div>

                {product.stock - productQuantity > 0 && (
                  <div className="grid text-sm font-semibold text-gray-600">
                    <span>
                      Only{" "}
                      <span className="text-customYellow">
                        {product.stock - productQuantity} items{" "}
                      </span>
                      left!
                    </span>
                    <span>Don't miss it</span>
                  </div>
                )}
              </div>

              <div className="grid gap-3 my-5">
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter Your Pincode Here"
                    onChange={(e) => setPincode(e.target.value)}
                  />
                  <Button onClick={checkAvailability}>
                    Check Availability{" "}
                  </Button>
                </div>
                <p className="text-sm px-2">{availabilityMessage}</p>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setPurchaseProduct(true)}>
                  Buy Now
                </Button>
                <Button variant="outline" onClick={handleAddToCart}>
                  Add to Cart
                </Button>
              </div>

              {purchaseProduct && (
                <div className="my-2 space-y-2">
                  <Input
                    placeholder="Enter Your Address Here..."
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <Button
                      variant={
                        paymentMethod === "razorpay" ? "default" : "outline"
                      }
                      onClick={() => setPaymentMethod("razorpay")}
                    >
                      Pay with Razorpay
                    </Button>
                    <Button
                      variant={paymentMethod === "cod" ? "default" : "outline"}
                      onClick={() => setPaymentMethod("cod")}
                    >
                      Cash on Delivery
                    </Button>
                  </div>
                  <Button onClick={handleBuyNow}>Confirm Order</Button>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* REVIEW SECTION */}

        <ReviewsComponent productId={product?._id} />
      </div>
    </>
  );
};

export default Product;
