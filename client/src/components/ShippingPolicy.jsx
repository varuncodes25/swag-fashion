import PolicyPageLayout from "@/components/common/PolicyPageLayout";
import { SITE } from "@/constants/siteConfig";

export default function ShippingPolicy() {
  return (
    <PolicyPageLayout title="Shipping & Delivery Policy" lastUpdated="June 26, 2026">
      <section>
        <h2 className="mb-2 text-xl font-semibold">Delivery areas</h2>
        <p>
          We ship across India through trusted courier partners (including Shiprocket).
          Enter your pincode on any product page to check serviceability and estimated
          delivery before you order.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold">Processing time</h2>
        <p>
          Orders are processed within 1–2 business days after confirmation. COD orders
          may take an extra day for verification before dispatch.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold">Delivery timeline</h2>
        <ul className="ml-6 list-disc space-y-2">
          <li>Metro cities: typically 3–5 business days after dispatch</li>
          <li>Other locations: typically 5–7 business days after dispatch</li>
          <li>Remote areas may take longer — exact ETA shown at pincode check</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold">Shipping charges</h2>
        <p>
          Shipping fees (if any) are calculated at checkout based on your pincode and
          order value. Free shipping may apply on eligible orders and will be shown
          before payment.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold">Order tracking</h2>
        <p>
          Once shipped, you&apos;ll receive tracking details by email/SMS. You can also
          use our{" "}
          <a href="/track-order" className="text-primary hover:underline">
            Track Order
          </a>{" "}
          page with your order number and mobile number.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold">Delivery issues</h2>
        <p>
          If your package is delayed, damaged, or marked delivered but not received,
          contact us within 48 hours at {SITE.email} or WhatsApp {SITE.phoneDisplay}{" "}
          with your order number.
        </p>
      </section>
    </PolicyPageLayout>
  );
}
