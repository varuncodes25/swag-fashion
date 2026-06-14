import React from "react";
import { Link } from "react-router-dom";
import swagiconDark from "@/assets/iconwhite.png";

const PrivacyPolicy = () => {
  const lastUpdated = "June 14, 2026";

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-black text-gray-900 dark:text-neutral-50 rounded-lg shadow-md my-10">
      <header className="w-full text-3xl font-bold text-center p-4 bg-card [box-shadow:0_4px_6px_-1px_rgba(0,0,0,0.1)]">
        Privacy Policy
      </header>

      <div className="relative max-h-[60vh] overflow-y-auto p-6 custom-scrollbar space-y-5 text-sm leading-relaxed sm:text-base">
        <p className="text-muted-foreground text-sm">
          Last updated: {lastUpdated}
        </p>

        <section>
          <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
          <p>
            <strong>Swag Fashion</strong> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates{" "}
            <strong>www.swagfashion.in</strong>. This Privacy Policy explains how we
            collect, use, store, and protect your personal information when you
            browse our website, create an account, place an order, or use our
            services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              <strong>Account information:</strong> name, email address, phone
              number, and password (for email sign-up).
            </li>
            <li>
              <strong>Google sign-in:</strong> if you use &quot;Continue with Google&quot;,
              we receive your name, email address, and profile picture from Google
              as permitted by your Google account settings.
            </li>
            <li>
              <strong>Order &amp; delivery details:</strong> shipping address,
              billing information, order history, product selections, and
              exchange/return requests.
            </li>
            <li>
              <strong>Payment information:</strong> online payments are processed
              by <strong>Razorpay</strong>. We do not store your full card, UPI,
              or bank details on our servers.
            </li>
            <li>
              <strong>Technical data:</strong> IP address, browser type, device
              information, and cookies required for login, cart, and site
              functionality.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. How We Use Your Information</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>To create and manage your account.</li>
            <li>To process orders, payments, exchanges, and deliveries.</li>
            <li>To send order confirmations, shipping updates, and support replies.</li>
            <li>To prevent fraud and keep our platform secure.</li>
            <li>To improve our website, products, and customer experience.</li>
            <li>To comply with applicable laws and regulations.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Sharing of Information</h2>
          <p className="mb-2">We do not sell your personal data. We may share limited information with:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              <strong>Payment partners</strong> (e.g. Razorpay) to process online
              payments securely.
            </li>
            <li>
              <strong>Shipping &amp; logistics partners</strong> (e.g. courier
              services) to deliver your orders and process exchanges.
            </li>
            <li>
              <strong>Service providers</strong> that help us operate the website
              (hosting, email, analytics) under confidentiality obligations.
            </li>
            <li>
              <strong>Legal authorities</strong> when required by law or to protect
              our rights and users.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Google Sign-In</h2>
          <p>
            When you sign in with Google, we use Google OAuth to authenticate you.
            Google&apos;s use of your data is governed by{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Google&apos;s Privacy Policy
            </a>
            . We only request basic profile and email scopes needed for account
            creation and login.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Cookies</h2>
          <p>
            We use cookies and similar technologies to keep you signed in,
            remember your cart, and improve site performance. You can control
            cookies through your browser settings, but some features may not work
            properly if cookies are disabled.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Data Retention</h2>
          <p>
            We retain your information for as long as your account is active or as
            needed to fulfill orders, resolve disputes, and meet legal
            obligations. You may request account deletion by contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">8. Your Rights</h2>
          <p>You may request to:</p>
          <ul className="list-disc ml-6 space-y-1 mt-2">
            <li>Access or update your profile information from your account page.</li>
            <li>Correct inaccurate personal data.</li>
            <li>Delete your account (subject to legal and order record requirements).</li>
            <li>Withdraw consent for marketing communications.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">9. Security</h2>
          <p>
            We use reasonable technical and organizational measures to protect your
            data, including encrypted connections (HTTPS) and secure payment
            processing. No method of transmission over the internet is 100%
            secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">10. Children&apos;s Privacy</h2>
          <p>
            Our services are not directed to children under 13. We do not knowingly
            collect personal information from children.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be
            posted on this page with an updated &quot;Last updated&quot; date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">12. Contact Us</h2>
          <p>
            For privacy-related questions or requests, contact us at{" "}
            <a
              href="mailto:swagfashion077@gmail.com"
              className="text-primary underline"
            >
              swagfashion077@gmail.com
            </a>{" "}
            or visit our{" "}
            <Link to="/contact" className="text-primary underline">
              Contact page
            </Link>
            .
          </p>
          <p className="mt-2">
            See also our{" "}
            <Link to="/termsandconditions" className="text-primary underline">
              Terms &amp; Conditions
            </Link>
            .
          </p>
        </section>
      </div>

      <section className="w-full h-36 bg-card text-center rounded-t-md shadow-md flex flex-col items-center justify-center mt-6">
        <h1 className="text-lg font-bold mb-2">Swag Fashion</h1>
        <img src={swagiconDark} alt="Swag Icon" className="h-16 w-16" />
      </section>
    </div>
  );
};

export default PrivacyPolicy;
