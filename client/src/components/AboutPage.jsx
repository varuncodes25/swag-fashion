import React, { useState, useEffect } from "react";

// Import images from your assets folder
import groupphoto from "../assets/groupphoto.png";

const AboutPage = () => {
  const images = [groupphoto];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 7000); // 7 seconds

    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">About Us</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          At Swag Fashion, we turn blank tees into bold statements. Founded in
          2025, we specialize in high-quality, custom T-shirt printing that
          brings your ideas to life — whether for brands, events, businesses, or
          personal projects.
        </p>
      </div>

      {/* Company Info */}
      <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
        <img
          src={images[currentIndex]}
          alt="T-Shirt Printing"
          className="w-full rounded-lg shadow-md transition-all duration-700"
        />
        <div>
          <h2 className="text-2xl font-semibold mb-4">Who We Are</h2>
          <p className="text-gray-700 dark:text-gray-300">
            We are Swag Fashion – a passionate team of trendsetters, creators,
            and style enthusiasts who believe fashion should be bold, affordable,
            and unapologetically you. Our mission is simple: to help you express
            yourself through style. Every piece in our collection is handpicked
            or designed with the perfect mix of quality, comfort, and the latest
            trends. From everyday essentials to statement outfits, we’re here to
            make sure you always have the confidence to own your look.
          </p>
        </div>
      </div>

      {/* Our Process */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-center mb-8">Our Process</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-2">Design</h3>
            <p className="text-gray-600 dark:text-gray-300">
              We design and print exactly the way you want. Your style, your
              vision – made real.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-2">About Tshirt</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Premium 220 GSM, 100% cotton T-shirts – built for comfort, made to
              last. Style that feels as good as it looks.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-2">Print on T-shirt</h3>
            <p className="text-gray-600 dark:text-gray-300">
              High-quality 220 GSM, 100% cotton T-shirts printed using advanced
              DTF technology and heat press – for vibrant, long-lasting designs.
            </p>
          </div>

          {/* Centered last row */}
          <div className="md:col-span-3 flex justify-center gap-8">
            <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl shadow w-full md:w-1/3">
              <h3 className="text-xl font-bold mb-2">Quality check</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We thoroughly check each product and its quality before dispatch
                to ensure you receive only the best.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl shadow w-full md:w-1/3">
              <h3 className="text-xl font-bold mb-2">Delivery</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We ensure safe, fast, and reliable delivery, so your order reaches
                you on time and in perfect condition.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
