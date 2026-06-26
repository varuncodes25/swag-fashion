import PolicyPageLayout from "@/components/common/PolicyPageLayout";
import { SITE } from "@/constants/siteConfig";

export default function ReturnPolicy() {
  return (
    <PolicyPageLayout title="Return & Exchange Policy" lastUpdated="June 26, 2026">
      <section>
        <h2 className="mb-2 text-xl font-semibold">Overview</h2>
        <p>
          At <strong>{SITE.brand}</strong>, we want you to love what you wear. If
          something isn&apos;t right, we offer <strong>easy exchanges</strong> within{" "}
          {SITE.exchangeWindowDays} days of delivery. We do not accept returns for
          refunds — exchanges only, in line with our Terms &amp; Conditions.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold">Eligible for exchange</h2>
        <ul className="ml-6 list-disc space-y-2">
          <li>Wrong size received or ordered</li>
          <li>Manufacturing defect or print issue</li>
          <li>Damaged item received (report within 48 hours with photos)</li>
          <li>Item unused, unwashed, with original tags attached</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold">Not eligible</h2>
        <ul className="ml-6 list-disc space-y-2">
          <li>Items worn, washed, or without tags</li>
          <li>Custom or personalized orders (unless defective)</li>
          <li>Exchange requests after {SITE.exchangeWindowDays} days from delivery</li>
          <li>Refund requests — we process exchanges, not monetary returns</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold">How to request an exchange</h2>
        <ol className="ml-6 list-decimal space-y-2">
          <li>Go to <strong>My Orders</strong> and select the order, or contact us on WhatsApp/email.</li>
          <li>Share your order number, issue, and photos if the item is damaged.</li>
          <li>Our team will confirm eligibility and arrange pickup or reverse logistics.</li>
          <li>Replacement is shipped after we receive and verify the original item.</li>
        </ol>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold">Exchange timeline</h2>
        <p>
          Exchange pickup and replacement dispatch typically take 5–10 business days
          after approval, depending on your location and stock availability.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold">Contact</h2>
        <p>
          Email: <a href={`mailto:${SITE.email}`} className="text-primary">{SITE.email}</a>
          <br />
          WhatsApp: {SITE.phoneDisplay}
          <br />
          {SITE.businessHours}
        </p>
      </section>
    </PolicyPageLayout>
  );
}
