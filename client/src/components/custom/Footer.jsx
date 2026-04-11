import React from "react";
import { Facebook, Instagram, Youtube, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Company Info */}
          <div className="space-y-3">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Swag Fashion
            </h3>
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
              <p className="text-sm leading-relaxed">
                Parshv Elite Building No.1, Birwadi Road, Near Railway Phatak, 
                Umroli East, Umroli, Palghar, Maharashtra - 401404
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground relative inline-block after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-8 after:h-0.5 after:bg-primary after:rounded-full">
              Explore
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground relative inline-block after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-8 after:h-0.5 after:bg-primary after:rounded-full">
              Services
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm">
                  Print on Demand
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm">
                  Bulk Orders
                </Link>
              </li>
              <li>
                <Link to="/Termsandconditions" className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground relative inline-block after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-8 after:h-0.5 after:bg-primary after:rounded-full">
              Connect Us
            </h4>
            <ul className="space-y-3 mb-4">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail size={16} className="text-primary" />
                <a
                  href="https://mail.google.com/mail/"
                  className="hover:text-primary transition-colors duration-200 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  swagfashion077@gmail.com
                </a>
              </li>
            </ul>
            
            {/* Social Icons - Always showing brand colors */}
            <div className="flex gap-3 mt-4">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/profile.php?id=61578870116136&mibextid=ZbWKwL"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1877F2] text-white p-2 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg"
              >
                <Facebook size={18} />
              </a>
              
              {/* YouTube */}
              <a
                href="https://www.youtube.com/@Swagfashion-h8d"
                aria-label="YouTube"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#FF0000] text-white p-2 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg"
              >
                <Youtube size={18} />
              </a>
              
              {/* Instagram */}
              <a
                href="https://www.instagram.com/swagfashion.in?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white p-2 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="mt-10 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Swag Fashion. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;