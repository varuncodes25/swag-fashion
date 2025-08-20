import React from "react";

const TermsAndConditions = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md my-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Terms and Conditions</h1>

      {/* Introduction */}
      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
        <p>
          Welcome to <strong>www.swagfashion.in</strong>, our online store! Swag Fashion and its associates provide their services subject to the following terms and conditions. By visiting or shopping on this website, you agree to these terms. Please read them carefully.
        </p>
      </section>

      {/* Privacy */}
      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">2. Privacy</h2>
        <p>
          At <strong>Swag Fashion</strong>, we respect your privacy and protect your personal information. By using our website, you agree to this policy.
        </p>
      </section>

      {/* Services Provided */}
      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">3. Services Provided</h2>
        <ul className="list-disc ml-6">
          <li>
            <strong>Easy Exchanges</strong><br />
            - You can exchange products, but returns are not accepted.<br />
            - Size or quality issues are handled quickly.
          </li>
          <li>
            <strong>Wide Range of Styles & Sizes</strong><br />
            - T-shirts for men, women, and kids (fits: slim, regular, oversized).<br />
            - Available in sizes S, M, L, XL, XXL, etc.
          </li>
          <li>
            <strong>Premium Quality Materials</strong><br />
            - Soft, durable, and comfortable fabrics.<br />
            - Eco-friendly or organic cotton options.
          </li>
          <li>
            <strong>Bulk Orders & Corporate Orders</strong><br />
            - Discounts available for bulk purchases.<br />
            - Custom designs for events, teams, or companies.
          </li>
          <li>
            <strong>Fast Shipping & Delivery</strong><br />
            - Multiple shipping options with tracking for all orders.
          </li>
          <li>
            <strong>Customer Support</strong><br />
            - Live chat, email, and phone support.<br />
            - Assistance with sizing, design, or order queries.
          </li>
          <li>
            <strong>Secure Payments</strong><br />
            - Multiple payment options: cards, online wallets, and COD.<br />
            - Safe and encrypted payment process.
          </li>
          <li>
            <strong>Pricing and Availability</strong><br />
            - Prices are subject to change without notice.<br />
            - Product availability may vary based on stock.
          </li>
          <li>
            <strong>Intellectual Property</strong><br />
            - All designs, logos, and content on the website are owned by Swag Fashion and cannot be copied or used without permission.
          </li>
        </ul>
      </section>

      {/* Additional Sections */}
      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">4. User Responsibilities</h2>
        <ul className="list-disc ml-6">
          <li>You must provide accurate information.</li>
          <li>You agree not to misuse the platform or engage in illegal activity.</li>
          <li>You’re responsible for maintaining the confidentiality of your account.</li>
        </ul>
      </section>

      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">5. Payments and Billing</h2>
        <ul className="list-disc ml-6">
          <li>All fees are listed clearly before purchase.</li>
          <li>Payments must be made through approved methods.</li>
          <li>No refunds unless stated in our Refund Policy.</li>
        </ul>
      </section>

      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">6. Limitation of Liability</h2>
        <p>
          <strong>Swag Fashion</strong> is not liable for indirect, incidental, or consequential damages arising from your use of the service.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">7. Termination</h2>
        <p>We may suspend or terminate your access if you violate these Terms.</p>
      </section>

      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">8. Governing Law</h2>
        <p>These Terms are governed by the laws of <strong>India</strong>.</p>
      </section>

      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">9. Changes to Terms</h2>
        <p>We reserve the right to update these Terms at any time. Changes will be posted on the website or communicated via email.</p>
      </section>

      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">10. Contact Information</h2>
        <p>
          For questions or concerns, contact us at: <br />
          Email: [Email] <br />
          Phone: [Phone] <br />
          Address: [Company Address]
        </p>
      </section>
    </div>
  );
};

export default TermsAndConditions;
