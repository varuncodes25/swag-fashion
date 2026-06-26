import { MessageCircle } from "lucide-react";
import { getWhatsAppUrl, SITE } from "@/constants/siteConfig";

export default function WhatsAppButton() {
  return (
    <a
      href={getWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${SITE.brand} on WhatsApp`}
      className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 active:scale-95 sm:bottom-6 sm:right-6"
    >
      <MessageCircle className="h-6 w-6" aria-hidden />
    </a>
  );
}
