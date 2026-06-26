import { Link } from "react-router-dom";

export default function PolicyPageLayout({ title, lastUpdated, children }) {
  return (
    <div className="mx-auto my-8 max-w-4xl rounded-lg bg-card text-foreground shadow-md sm:my-10">
      <header className="w-full bg-card p-4 text-center text-2xl font-bold shadow-sm sm:text-3xl">
        {title}
      </header>
      <div className="custom-scrollbar max-h-[70vh] space-y-5 overflow-y-auto p-6 text-sm leading-relaxed sm:text-base">
        {lastUpdated && (
          <p className="text-xs text-muted-foreground sm:text-sm">
            Last updated: {lastUpdated}
          </p>
        )}
        {children}
        <div className="border-t border-border pt-4 text-sm text-muted-foreground">
          Questions?{" "}
          <Link to="/contact" className="text-primary hover:underline">
            Contact us
          </Link>{" "}
          or{" "}
          <Link to="/faq" className="text-primary hover:underline">
            read FAQs
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
