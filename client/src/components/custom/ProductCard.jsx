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

      <img
        src={image.url}
        alt={name}
        className="object-cover w-[30rem] h-[20rem]"
      />
      <div className="px-3 grid gap-1 py-2 absolute bg-white dark:bg-zinc-900 w-full bottom-0 
  opacity-0 translate-y-[3rem] 
  group-hover:opacity-100 group-hover:translate-y-0 
  transform transition-all ease-in-out duration-300 
  rounded-xl pointer-events-none group-hover:pointer-events-auto">

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
