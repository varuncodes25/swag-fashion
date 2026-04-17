import React from "react";

const AboutPage = () => {
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

      {/* Who We Are */}
      <div className="mb-16 text-center max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Who We Are</h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          We are Swag Fashion – a passionate team of trendsetters, creators,
          and style enthusiasts who believe fashion should be bold, affordable,
          and unapologetically you. Our mission is simple: to help you express
          yourself through style.
          <br /><br />
          Every piece in our collection is designed with the perfect mix of
          quality, comfort, and the latest trends. From everyday essentials to
          statement outfits, we ensure you always have the confidence to own
          your look.
        </p>
      </div>

      {/* Our Process */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-center mb-10">
          Our Process
        </h2>

        <div className="grid md:grid-cols-3 gap-8 text-center">
          
          <div className="p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow hover:shadow-xl transition">
            <h3 className="text-xl font-bold mb-2">Design</h3>
            <p className="text-gray-600 dark:text-gray-300">
              We design and print exactly the way you want. Your style, your
              vision – made real.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow hover:shadow-xl transition">
            <h3 className="text-xl font-bold mb-2">Premium Fabric</h3>
            <p className="text-gray-600 dark:text-gray-300">
              220 GSM, 100% cotton T-shirts – built for comfort and made to last.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow hover:shadow-xl transition">
            <h3 className="text-xl font-bold mb-2">Printing</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Advanced DTF printing and heat press technology for vibrant,
              long-lasting designs.
            </p>
          </div>

          {/* Bottom Row */}
          <div className="md:col-span-3 flex flex-col md:flex-row justify-center gap-8">
            
            <div className="p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow hover:shadow-xl transition w-full md:w-1/3">
              <h3 className="text-xl font-bold mb-2">Quality Check</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Every product is carefully inspected before dispatch to ensure
                premium quality.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow hover:shadow-xl transition w-full md:w-1/3">
              <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Safe, fast, and reliable shipping so your order reaches you on
                time.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;