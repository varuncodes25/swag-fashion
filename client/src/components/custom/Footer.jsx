import React from "react";
import { Facebook, Instagram, Youtube, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Company Name (Centered) */}
          <div className="flex items-center justify-center">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent text-center">
              Swag Fashion
            </h3>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground relative inline-block after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-8 after:h-0.5 after:bg-primary after:rounded-full">
              Explore
            </h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted-foreground hover:text-primary text-sm">Home</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-primary text-sm">About Us</Link></li>
              <li><Link to="/faq" className="text-muted-foreground hover:text-primary text-sm">FAQs</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary text-sm">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground relative inline-block after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-8 after:h-0.5 after:bg-primary after:rounded-full">
              Services
            </h4>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary text-sm">Print on Demand</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary text-sm">Bulk Orders</Link></li>
              <li><Link to="/Termsandconditions" className="text-muted-foreground hover:text-primary text-sm">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground relative inline-block after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-8 after:h-0.5 after:bg-primary after:rounded-full">
              Connect Us
            </h4>

            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Mail size={16} className="text-primary" />
              <a
                href="mailto:swagfashion077@gmail.com"
                className="hover:text-primary text-sm"
              >
                swagfashion077@gmail.com
              </a>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3">
              <a href="#" className="bg-[#1877F2] text-white p-2 rounded-full hover:scale-110">
                <Facebook size={18} />
              </a>
              <a href="https://www.youtube.com/@Swagfashion-h8d" target="_blank" className="bg-[#FF0000] text-white p-2 rounded-full hover:scale-110">
                <Youtube size={18} />
              </a>
              <a  href="https://www.instagram.com/swagfashion.in?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" className="bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white p-2 rounded-full hover:scale-110">
                <Instagram size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
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