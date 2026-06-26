/** Central contact & social config — update here for the whole site */
export const SITE = {
  brand: "Swag Fashion",
  email: "swagfashion077@gmail.com",
  phone: "9702447092",
  phoneDisplay: "+91 97024 47092",
  whatsappNumber: "919702447092",
  whatsappMessage: "Hi Swag Fashion, I need help with my order.",
  address: "Mumbai, Maharashtra, India",
  businessHours: "Mon–Sat, 10:00 AM – 7:00 PM IST",
  responseTime: "We usually reply within 24 hours",
  instagram: {
    url: "https://www.instagram.com/swagfashion.in",
    handle: "@swagfashion.in",
  },
  youtube: "https://www.youtube.com/@Swagfashion-h8d",
  facebook: "https://www.facebook.com/swagfashion.in",
  foundedYear: 2025,
  exchangeWindowDays: 7,
};

/** Single source of truth for return/exchange copy across the site */
export const POLICY = {
  exchangeWindowDays: SITE.exchangeWindowDays,
  exchangeShort: `${SITE.exchangeWindowDays}-day exchange`,
  exchangeLabel: `${SITE.exchangeWindowDays}-day easy exchange`,
  exchangeDetail:
    "Easy exchange within 7 days of delivery for size or quality issues. Monetary returns/refunds are not offered.",
  noReturnsNote: "Exchanges only — no monetary returns",
  returnConditions:
    "Item must be unworn, unwashed, with original tags attached.",
};

export function formatSoldCount(count) {
  const n = Number(count) || 0;
  if (n < 5) return null;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k+ sold`;
  if (n >= 100) return `${Math.floor(n / 50) * 50}+ sold`;
  return `${n}+ sold`;
}

export function getWhatsAppUrl(message = SITE.whatsappMessage) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${SITE.whatsappNumber}?text=${text}`;
}

export const SHOPPER_FAQS = [
  {
    question: "How do I place an order?",
    answer:
      "Browse products, pick your size and color, add to cart or tap Buy Now, then complete checkout with your address and payment (UPI, card, or COD where available).",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept UPI, debit/credit cards, net banking via Razorpay, and Cash on Delivery (COD) on eligible orders.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Most orders reach within 3–7 business days after dispatch. Enter your pincode on the product page for an estimated delivery date.",
  },
  {
    question: "Do you offer Cash on Delivery (COD)?",
    answer:
      "Yes, COD is available on eligible orders. Any COD fee (if applicable) is shown at checkout before you place the order.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Use Track Order in the footer with your order number and registered mobile number, or check My Orders when logged in.",
  },
  {
    question: "What is your exchange policy?",
    answer:
      "We offer easy exchanges within 7 days of delivery for size or quality issues. Returns are not accepted — see our Return & Exchange Policy for full details.",
  },
  {
    question: "How do I request an exchange?",
    answer:
      "Open your order in My Orders and use the exchange option, or contact us on WhatsApp/email with your order number and the issue.",
  },
  {
    question: "How should I choose the right size?",
    answer:
      "Use the size chart on each product page. If you're between sizes, we recommend sizing up for oversized fits.",
  },
  {
    question: "Are the prints and fabric good quality?",
    answer:
      "We use premium cotton (180–240 GSM) and DTF printing for vibrant, long-lasting designs. Every piece goes through a quality check before shipping.",
  },
  {
    question: "How do I contact customer support?",
    answer:
      `Email ${SITE.email}, WhatsApp us, or use the Contact page. ${SITE.businessHours}.`,
  },
];
