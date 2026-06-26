import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { SHOPPER_FAQS } from "@/constants/siteConfig";

const FaqPage = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-12">
      <h1 className="mb-2 text-center text-3xl font-extrabold text-foreground sm:text-4xl">
        Frequently Asked Questions
      </h1>
      <p className="mb-8 text-center text-sm text-muted-foreground">
        Orders, delivery, payments, exchanges &amp; more
      </p>

      <div className="mb-8 flex flex-wrap justify-center gap-3 text-sm">
        <Link to="/shipping-policy" className="text-primary hover:underline">
          Shipping policy
        </Link>
        <span className="text-muted-foreground">·</span>
        <Link to="/return-policy" className="text-primary hover:underline">
          Return &amp; exchange
        </Link>
        <span className="text-muted-foreground">·</span>
        <Link to="/contact" className="text-primary hover:underline">
          Contact support
        </Link>
      </div>

      <div className="space-y-4">
        {SHOPPER_FAQS.map((faq, index) => {
          const isActive = activeIndex === index;
          return (
            <div
              key={index}
              className="rounded-xl border border-border bg-card shadow-sm transition-all"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between px-5 py-4 text-left text-base font-semibold text-foreground transition-colors hover:bg-muted/50 sm:text-lg"
                onClick={() => toggle(index)}
                aria-expanded={isActive}
              >
                {faq.question}
                <ChevronDown
                  size={20}
                  className={`shrink-0 transition-transform duration-200 ${
                    isActive ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden px-5 text-sm text-muted-foreground transition-all duration-300 sm:text-base ${
                  isActive ? "max-h-48 pb-4" : "max-h-0"
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
