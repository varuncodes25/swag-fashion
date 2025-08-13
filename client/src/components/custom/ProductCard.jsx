import { starsGenerator } from "@/constants/helper";
import { toast } from "@/hooks/use-toast";
import { addToCart } from "@/redux/slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const ProductCard = ({
  _id,
  name = "Product Title",
  price = 2000,
  rating = 4,
  image = {
    url: "https://images.pexels.com/photos/3801990/pexels-photo-3801990.jpeg?auto=compress&cs=tinysrgb&w=600",
    id: "322dadaf",
  },
  discountedPrice = price,
  discount = 0
}) => {
  const slug = name.split(" ").join("-");
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    dispatch(
      addToCart({
        _id,
        name,
        price: discountedPrice || price,
        quantity: 1,
        image: image.url,
      })
    );
    toast({ title: "Product added to cart" });
  };

  return (
    <Link
      to={`/product/${slug}`}
      className="border rounded-2xl overflow-hidden shadow-md transform 
                 transition-transform duration-300 hover:scale-[1.02] bg-white dark:bg-zinc-900"
    >
      {/* Product Image */}
      <div className="w-full h-58 overflow-hidden">
        <img
          src={image.url}
          alt={name}
          className="object-cover w-full h-full"
        />
      </div>

      {/* Product Info */}
      <div className="p-3 ">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {name}
        </h3>
        <div className="flex items-center mt-1">
          <div className="flex text-xs">{starsGenerator(rating)}</div>
          <span className="text-xs text-gray-500 ml-1">
            ({rating.toFixed(1)})
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          {discount > 0 && (
            <span className="text-xs text-gray-400 line-through">
              ₹{price.toFixed(2)}
            </span>
          )}
          <span className="text-lg font-bold text-gray-900 dark:text-yellow-400">
            ₹{(discountedPrice || price).toFixed(2)}
          </span>
        </div>
        {discount > 0 && (
          <span className="inline-block mt-1 bg-yellow-300 text-yellow-900 text-xs px-1.5 py-0.5 rounded-full">
            {discount}% OFF
          </span>
        )}
        <button
          className="mt-2 w-full py-1.5 bg-yellow-500 text-gray-900 text-sm font-medium rounded-md hover:bg-yellow-600 transition-colors"
          onClick={handleAddToCart}
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
