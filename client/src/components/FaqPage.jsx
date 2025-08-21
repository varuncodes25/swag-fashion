import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    question: "What types of T-shirts do you offer for printing?",
    answer:
      "We offer 100% cotton, blended, and performance dry-fit T-shirts in various sizes and colors.",
  },
  {
    question: "Can I print my own design?",
    answer:
      "Absolutely! Please email your artwork or design to us when placing your order.",
  },
  {
    question: "What printing methods do you use?",
    answer:
      "We use screen printing, DTG (Direct to Garment), and heat transfer vinyl depending on the order and design.",
  },
  {
    question: "Is there a minimum order quantity?",
    answer:
      "No, you can order even a single custom T-shirt. Bulk orders receive a discount.",
  },
  {
    question: "How long does it take to receive my order?",
    answer:
      "Typical turnaround time is 3–7 business days depending on the order size and shipping method.",
  },
  {
    question: "Do you offer bulk pricing or discounts?",
    answer:
      "Yes! The more you order, the more you save. Contact us for a custom quote.",
  },
];

const FaqPage = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-extrabold text-center mb-10 text-zinc-900 dark:text-zinc-100">
        Frequently Asked Questions
      </h1>
      <div className="space-y-5">
        {faqs.map((faq, index) => {
          const isActive = activeIndex === index;
          return (
            <div
              key={index}
              className="border rounded-xl bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-sm transition-all"
            >
              <button
                className="w-full flex justify-between items-center px-6 py-4 text-left text-lg font-semibold text-zinc-800 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                onClick={() => toggle(index)}
              >
                {faq.question}
                <span className={`transition-transform duration-200 ${isActive ? "rotate-180" : ""}`}>
                  <ChevronDown size={20} />
                </span>
              </button>
              <div
                className={`px-6 pt-0 overflow-hidden transition-all duration-300 text-zinc-600 dark:text-zinc-300 ${
                  isActive ? "max-h-40 pb-4" : "max-h-0"
                }`}
              >
                <p>{faq.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FaqPage;
