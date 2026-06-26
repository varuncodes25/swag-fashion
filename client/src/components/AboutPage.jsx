import { Link } from "react-router-dom";
import { ShieldCheck, Users, Package, Star } from "lucide-react";
import { SITE } from "@/constants/siteConfig";

const AboutPage = () => {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="mb-12 text-center sm:mb-16">
        <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-5xl">
          About <span className="text-primary">{SITE.brand}</span>
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Bold tees, premium cotton, and streetwear that fits your vibe. Founded in{" "}
          {SITE.foundedYear}, we deliver quality prints and comfortable fits across
          India — for everyday wear, college, gym, and everything in between.
        </p>
      </div>

      <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
        {[
          { icon: Users, stat: "10,000+", label: "Happy customers" },
          { icon: Package, stat: "180–240 GSM", label: "Premium cotton" },
          { icon: Star, stat: "4.8★", label: "Average rating" },
          { icon: ShieldCheck, stat: "QC", label: "Every order checked" },
        ].map(({ icon: Icon, stat, label }) => (
          <div
            key={label}
            className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm"
          >
            <Icon className="mx-auto mb-2 h-6 w-6 text-primary" />
            <p className="text-lg font-bold text-foreground">{stat}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="mb-16 max-w-3xl mx-auto text-center">
        <h2 className="mb-4 text-2xl font-semibold sm:text-3xl">Who we are</h2>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          We&apos;re a team of creators who believe fashion should be bold, affordable,
          and expressive. Every piece balances comfort, quality, and modern design — so
          you don&apos;t just wear clothes, you wear confidence.
        </p>
      </div>

      <div className="mb-16">
        <h2 className="mb-8 text-center text-2xl font-semibold sm:text-3xl">
          Our process
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Design",
              desc: "Trend-led graphics, anime, acid wash, minimal & solids.",
            },
            {
              title: "Premium fabric",
              desc: "180–240 GSM 100% cotton — soft, durable, everyday comfort.",
            },
            {
              title: "DTF printing",
              desc: "Vibrant, long-lasting prints that survive washes.",
            },
            {
              title: "Quality check",
              desc: "Every unit inspected before it ships to you.",
            },
            {
              title: "Fast delivery",
              desc: "Pan-India shipping with tracking on every order.",
            },
            {
              title: "Easy exchange",
              desc: `${SITE.exchangeWindowDays}-day exchange support for size or quality issues.`,
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md"
            >
              <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-muted/40 p-6 text-center sm:p-8">
        <h2 className="mb-2 text-xl font-semibold">Shop with confidence</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Secure payments · COD · Pincode delivery check · Track your order anytime
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/shipping-policy" className="text-sm font-medium text-primary hover:underline">
            Shipping policy
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link to="/return-policy" className="text-sm font-medium text-primary hover:underline">
            Return &amp; exchange
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link to="/contact" className="text-sm font-medium text-primary hover:underline">
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
