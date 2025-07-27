import React from "react";

const AboutPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">About Us</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          We're passionate about helping you wear your creativity. Whether it's custom apparel for your team, business, or brand, we’ve got your back (and your front).
        </p>
      </div>

      {/* Company Info */}
      <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
        <img
          src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f"
          alt="T-Shirt Printing"
          className="w-full rounded-lg shadow-md"
        />
        <div>
          <h2 className="text-2xl font-semibold mb-4">Who We Are</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Founded in 2021, our custom T-shirt printing studio was born out of a love for design and expression. We believe that what you wear should tell a story — your story. From individuals to startups and events, we’ve helped thousands bring their ideas to life on fabric.
          </p>
        </div>
      </div>

      {/* Our Process */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-center mb-8">Our Process</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-2">1. Upload</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Choose your T-shirt style and upload your design or use our built-in design tools.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-2">2. Print</h3>
            <p className="text-gray-600 dark:text-gray-300">
              We use high-quality DTG, screen, or vinyl printing methods for every order.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-2">3. Deliver</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Your custom T-shirts are shipped right to your doorstep — fast and hassle-free.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-12">
        <h3 className="text-2xl font-bold mb-4">Ready to print your story?</h3>
        <a
          href="/contact"
          className="inline-block px-6 py-3 bg-yellow-500 text-white font-semibold rounded-full hover:bg-yellow-600 transition"
        >
          Get in Touch
        </a>
      </div>
    </div>
  );
};

export default AboutPage;
