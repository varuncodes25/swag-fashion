import { Facebook, Instagram, Youtube, Mail, Phone, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import PaymentTrustRow from "@/components/common/PaymentTrustRow";
import { getWhatsAppUrl, SITE } from "@/constants/siteConfig";

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
        {/* <div className="mb-8">
          <PaymentTrustRow title="Safe & secure payments" compact />
        </div> */}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 md:grid-cols-4 lg:gap-12">
          <div className="flex items-center justify-center md:justify-start">
            <h3 className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-center text-xl font-bold text-transparent sm:text-2xl">
              {SITE.brand}
            </h3>
          </div>

          <div>
            <h4 className="relative mb-3 inline-block text-base font-semibold text-foreground after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-8 after:rounded-full after:bg-primary after:content-[''] sm:mb-4 sm:text-lg">
              Explore
            </h4>
            <ul className="space-y-2">
              <li><Link to="/" className="link-premium text-sm">Home</Link></li>
              <li><Link to="/about" className="link-premium text-sm">About Us</Link></li>
              <li><Link to="/faq" className="link-premium text-sm">FAQs</Link></li>
              <li><Link to="/contact" className="link-premium text-sm">Contact</Link></li>
              <li><Link to="/track-order" className="link-premium text-sm">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="relative mb-3 inline-block text-base font-semibold text-foreground after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-8 after:rounded-full after:bg-primary after:content-[''] sm:mb-4 sm:text-lg">
              Policies
            </h4>
            <ul className="space-y-2">
              <li><Link to="/shipping-policy" className="link-premium text-sm">Shipping Policy</Link></li>
              <li><Link to="/return-policy" className="link-premium text-sm">Return &amp; Exchange</Link></li>
              <li><Link to="/termsandconditions" className="link-premium text-sm">Terms &amp; Conditions</Link></li>
              <li><Link to="/privacy-policy" className="link-premium text-sm">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="relative mb-3 inline-block text-base font-semibold text-foreground after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-8 after:rounded-full after:bg-primary after:content-[''] sm:mb-4 sm:text-lg">
              Connect
            </h4>

            <div className="mb-3 flex items-center gap-2 text-muted-foreground">
              <Mail size={16} className="shrink-0 text-primary" />
              <a href={`mailto:${SITE.email}`} className="text-sm hover:text-primary">
                {SITE.email}
              </a>
            </div>
            <div className="mb-3 flex items-center gap-2 text-muted-foreground">
              <Phone size={16} className="shrink-0 text-primary" />
              <a href={`tel:+91${SITE.phone}`} className="text-sm hover:text-primary">
                {SITE.phoneDisplay}
              </a>
            </div>
            <div className="mb-4 flex items-center gap-2 text-muted-foreground">
              <MessageCircle size={16} className="shrink-0 text-[#25D366]" />
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:text-primary"
              >
                WhatsApp support
              </a>
            </div>

            <div className="flex gap-3">
              <a
                href={SITE.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${SITE.brand} on Facebook`}
                className="rounded-full bg-[#1877F2] p-2 text-white hover:scale-110"
              >
                <Facebook size={18} aria-hidden />
              </a>
              <a
                href={SITE.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${SITE.brand} on YouTube`}
                className="rounded-full bg-[#FF0000] p-2 text-white hover:scale-110"
              >
                <Youtube size={18} aria-hidden />
              </a>
              <a
                href={SITE.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${SITE.brand} on Instagram`}
                className="rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] p-2 text-white hover:scale-110"
              >
                <Instagram size={18} aria-hidden />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-4 text-center sm:mt-10 sm:pt-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {SITE.brand}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
