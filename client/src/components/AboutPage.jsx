import React from "react";

const AboutPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
          About <span className="text-primary">Swag Fashion</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          We turn blank tees into bold statements. Founded in 2025, Swag Fashion
          delivers high-quality custom T-shirt printing for brands, creators,
          and individuals who want to stand out.
        </p>
      </div>

      {/* Who We Are */}
      <div className="mb-20 text-center max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">
          Who We Are
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
          We are a team of creators and trendsetters who believe fashion should
          be bold, affordable, and expressive. Every piece is crafted with the
          perfect balance of comfort, quality, and modern design — so you don’t
          just wear clothes, you wear confidence.
        </p>
      </div>

      {/* Our Process */}
      <div>
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12">
          Our Process
        </h2>

        {/* Top Row */}
        <div className="grid md:grid-cols-3 gap-8 text-center mb-10">
          
          {/* Design */}
          <div className="p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition duration-300">
            <h3 className="text-xl font-bold mb-2">Design</h3>
            <p className="text-muted-foreground text-sm">
              Your vision comes to life with creative, bold, and unique designs.
            </p>
          </div>

          {/* Fabric */}
          <div className="p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition duration-300">
            <h3 className="text-xl font-bold mb-2">Premium Fabric</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              180 GSM, 200 GSM, 220 GSM, 240 GSM 100% cotton — soft, durable, and made for everyday wear.
            </p>
          </div>

          {/* Printing */}
          <div className="p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition duration-300">
            <h3 className="text-xl font-bold mb-2">Printing</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Advanced DTF printing ensures vibrant and long-lasting designs.
            </p>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row justify-center gap-8 text-center">
          
          {/* Quality */}
          <div className="p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition duration-300 w-full md:w-1/3">
            <h3 className="text-xl font-bold mb-2">Quality Check</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Every product is inspected carefully before it reaches you.
            </p>
          </div>

          {/* Delivery */}
          <div className="p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition duration-300 w-full md:w-1/3">
            <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Reliable and fast shipping — delivered safely to your doorstep.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AboutPage;