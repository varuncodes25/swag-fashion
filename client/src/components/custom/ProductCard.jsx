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
  discountedPrice,
  discount,
  offerValidTill
}) => {
  const slug = name.split(" ").join("-");
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const handleAddToCart = () => {
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
     <div className="max-w-sm bg-white dark:bg-zinc-900 rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 cursor-pointer select-none">
  <div className="w-80 h-56 sm:h-60 md:h-72 lg:h-80 xl:h-88 rounded-t-3xl overflow-hidden mx-auto">
    <img
      src={image.url}
      alt={name}
      className="object-cover w-full h-full transition-transform duration-300 ease-in-out hover:scale-105"
    />
  </div>

  <div className="p-4 grid gap-3 lg:hidden">
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate">{name}</h2>

    <div className="flex items-center space-x-2">
      <div className="flex text-sm">{starsGenerator(rating)}</div>
      <span className="text-gray-500 dark:text-gray-400 text-sm">({rating.toFixed(1)})</span>
    </div>

    {/* Price Section */}
    {(() => {
      const now = new Date();
      const isOfferActive = offerValidTill ? new Date(offerValidTill) >= now && discount > 0 : false;
      const displayPrice = isOfferActive ? discountedPrice : price;

      return (
        <div className="flex items-baseline gap-3">
          {isOfferActive && (
            <span className="text-md text-gray-400 dark:text-gray-500 line-through select-none">
              ₹{price.toFixed(2)}
            </span>
          )}
          <span className="text-3xl font-extrabold text-gray-900 dark:text-yellow-400">
            ₹{displayPrice.toFixed(2)}
          </span>
          {isOfferActive && (
            <span className="bg-yellow-300 dark:bg-yellow-600 text-yellow-900 dark:text-yellow-100 text-xs font-semibold px-2 py-0.5 rounded-full select-none">
              {discount}% OFF
            </span>
          )}
        </div>
      );
    })()}

    <button
      className="mt-3 px-6 py-2 bg-yellow-500 dark:bg-yellow-400 text-gray-900 dark:text-gray-900 font-semibold rounded-lg shadow-md hover:bg-yellow-600 dark:hover:bg-yellow-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
      onClick={() => handleAddToCart()}
    >
      Add to Cart
    </button>
  </div>
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
