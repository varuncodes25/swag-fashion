import { starsGenerator } from "@/constants/helper";
import { Link } from "react-router-dom";

const ProductCard = ({
  name = "Product Title",
  price = 2000,
  rating = 4,
  image = {
    url: "https://images.pexels.com/photos/3801990/pexels-photo-3801990.jpeg?auto=compress&cs=tinysrgb&w=600",
    id: "322dadaf",
  },
}) => {
  const slug = name.split(" ").join("-");

  return (
    <Link
      to={`/product/${slug}`}
      className="relative border w-fit overflow-clip grid z-1 rounded-2xl cursor-pointer group transform transition-transform duration-300 hover:scale-105 hover:shadow-md"
    >
      <div className="max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
        <img
          src={image.url}
          alt={name}
          className="
      object-cover
      w-full
      h-[14rem]     /* mobile */
      sm:h-[15rem]  /* small devices ≥640px */
      md:h-[18rem]  /* medium devices ≥768px */
      lg:h-[20rem]  /* large devices ≥1024px */
      xl:h-[22rem]  /* extra-large devices ≥1280px */
      rounded-t-2xl
    "
        />
        <div className="p-2 grid gap-2  lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {name}
          </h2>

          <div className="flex justify-between items-center p-0">
            <div className="flex text-xs">{starsGenerator(rating)}</div>{" "}
            {/* smaller stars */}
          </div>

          <div className="flex gap-2">
            <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
              ₹{price}
            </span>
            <span className="text-2xl font-extrabold text-gray-800 dark:text-gray-300">
              200
            </span>
          </div>

          <button className="mt-2 px-4 py-2 bg-customYellow text-white rounded-lg hover:bg-yellow-600 transition-colors duration-200">
            Add to Cart
          </button>
        </div>
      </div>

      <div
  className="
    px-3 grid gap-1 py-2 absolute bg-white dark:bg-zinc-900 w-full bottom-0 
    opacity-0 translate-y-[3rem]         
    lg:opacity-0 lg:translate-y-[3rem]    
    lg:group-hover:opacity-100 lg:group-hover:translate-y-0  /* show only on lg hover */
    transform transition-all ease-in-out duration-300 
    rounded-xl pointer-events-none lg:pointer-events-auto
  "
>

        <h2 className="text-lg font-semibold">{name}</h2>

        <div className="flex justify-between items-center">
          <div className="flex">{starsGenerator(rating)}</div>
          <span className="text-sm font-medium">₹{price}</span>
        </div>

        <div className="text-sm text-primary underline mt-1">View Product</div>
      </div>
    </Link>
  );
};

export default ProductCard;
