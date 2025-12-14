import { useNavigate } from "react-router-dom";

import solid from "../../assets/solid.jpg";
import polo from "../../assets/polo.png";
import oversized from "../../assets/oversized.jpg";
import printed from "../../assets/printed.jpg";
import simple from "../../assets/simplicity_at_its_finest_1.png";

const collections = [
  { name: "Solid T-Shirts", img: solid },
  { name: "Polo T-Shirts", img: polo },
  { name: "Oversized T-Shirts", img: oversized },
  { name: "Printed T-Shirts", img: printed },
  { name: "Graphic Tees", img: simple },
];

export default function HomeCollections() {
  const navigate = useNavigate();

  return (
    <section className="py-12">
      {/* Title */}
      <h2 className="text-3xl font-bold text-center mb-10">
        Shop by Collection
      </h2>

      {/* Scroll */}
      <div className="flex justify-center">
        <div className="flex gap-8 overflow-x-auto px-6 scrollbar-hide">
          {collections.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(`/collections/${item.name}`)}
              className="min-w-[220px] bg-white rounded-2xl 
                         shadow-md hover:shadow-2xl 
                         transition-all duration-300 
                         cursor-pointer group"
            >
              {/* Image */}
              <div className="h-52 w-full overflow-hidden rounded-t-2xl">
                <img
                  src={item.img}
                  alt={item.name}
                  className="h-full w-full object-cover 
                             group-hover:scale-110 transition duration-300"
                />
              </div>

              {/* Text */}
              <div className="p-4 text-center">
                <p className="text-lg font-semibold">
                  {item.name}
                </p>
                <span className="text-sm text-gray-500">
                  Explore Collection →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
