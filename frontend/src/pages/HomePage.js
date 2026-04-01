
import { useState } from "react";
import Footer from "../components/Footer";

function HomePage({ onChangeView, isAuthenticated, role }) {
  const [quickSerial, setQuickSerial] = useState("");

  const goSearch = () => {
    try {
      if (quickSerial.trim()) {
        sessionStorage.setItem("bw_search_prefill", quickSerial.trim());
      } else {
        sessionStorage.removeItem("bw_search_prefill");
      }
    } catch (_e) {
      // ignore storage failures
    }
    onChangeView("guest");
  };

  return (
    <div className="view active">
      <section className="bw-hero">
        <div className="bw-hero-inner">
          <p className="bw-badge">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Blockchain-Powered Warranty
          </p>
          <h1 className="bw-hero-title">
            Your Products, <span className="accent">Secured Forever</span>
          </h1>
          <p className="bw-hero-lead">
            Transform product warranties into unforgeable digital assets. Track, transfer, and
            verify with complete transparency.
          </p>
          <div className="bw-hero-cta">
            <button type="button" className="btn-hero-emerald" onClick={goSearch}>
              Try Public Search <span aria-hidden="true">→</span>
            </button>
            <button
              type="button"
              className="btn-hero-outline"
              onClick={() => onChangeView(isAuthenticated ? (role === "admin" ? "admin" : "user") : "auth")}
            >
              Access Your Wallet
            </button>
          </div>
        </div>
      </section>

      <section className="bw-section" id="track">
        <div className="bw-inner">
          <h2 className="bw-h2">Track Your Warranty</h2>
          <p className="bw-sub">Enter a device serial number or scan QR code to verify warranty status.</p>
          <div className="bw-track-card">
            <div className="bw-search-row">
              <div className="bw-search-input-wrap">
                <span aria-hidden="true" className="bw-search-ic">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </span>
                <input
                  type="search"
                  placeholder="Enter Device Serial Number (e.g., FNQW8123XYZ)"
                  aria-label="Serial number"
                  value={quickSerial}
                  onChange={(e) => setQuickSerial(e.target.value)}
                />
              </div>
              <button type="button" className="bw-search-btn" onClick={goSearch}>
                Search Warranty
              </button>
            </div>
            <p className="bw-hint">Or scan QR code from product packaging.</p>
          </div>
          <div className="bw-start-card">
            <div className="bw-start-icon" aria-hidden="true">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <h3>Start Your Search</h3>
            <p>Enter a serial number above to view warranty details and repair history.</p>
          </div>
        </div>
      </section>

      <section className="bw-section alt" id="welcome">
        <div className="bw-inner">
          <h2 className="bw-h2">Welcome to the Future of Product Warranties</h2>
          <p className="bw-sub">
            BlockWarranty revolutionizes how warranties are issued, managed, and transferred. Say goodbye to lost
            paper receipts and fraudulent claims. Say hello to secure, verifiable, and transferable digital warranties.
          </p>
          <div className="bw-feature-row">
            <article className="bw-feature-card">
              <div className="bw-icon-em" aria-hidden="true">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h4>Tamper-Proof</h4>
              <p>Every warranty is stored on the blockchain, making it impossible to forge, alter, or lose.</p>
            </article>
            <article className="bw-feature-card">
              <div className="bw-icon-em" aria-hidden="true">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15 15 0 0115 15" />
                </svg>
              </div>
              <h4>Globally Accessible</h4>
              <p>Access your warranties from anywhere in the world, anytime, with just an internet connection.</p>
            </article>
            <article className="bw-feature-card">
              <div className="bw-icon-em" aria-hidden="true">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h4>Instant Transfer</h4>
              <p>Transfer warranties to new owners instantly when selling your products, adding value to resale.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="bw-section" id="how">
        <div className="bw-inner">
          <h2 className="bw-h2">How It Works</h2>
          <p className="bw-sub">Three simple steps to secure your products with blockchain technology.</p>
          <div className="bw-steps">
            <article className="bw-step-card">
              <div className="bw-step-num">1</div>
              <h4>Purchase Product</h4>
              <p>Buy from participating retailers and manufacturers.</p>
            </article>
            <article className="bw-step-card">
              <div className="bw-step-num">2</div>
              <h4>Receive NFT Warranty</h4>
              <p>A unique digital warranty is minted and sent to your wallet.</p>
            </article>
            <article className="bw-step-card">
              <div className="bw-step-num">3</div>
              <h4>Manage &amp; Transfer</h4>
              <p>Track repairs, claim warranty, and transfer ownership seamlessly.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="bw-section alt" id="trust">
        <div className="bw-inner">
          <div className="bw-trust">
            <div className="bw-trust-visual">
              <div className="bw-trust-mock">
                <svg
                  className="shield-lg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>BLOCKCHAIN</span>
              </div>
            </div>
            <div className="bw-trust-copy">
              <h3>
                Built on Trust, Powered by <span className="accent">Innovation</span>
              </h3>
              <p>
                BlockWarranty combines enterprise-grade blockchain security with a modern, wallet-inspired experience
                your customers already understand.
              </p>
              <ul className="bw-check-list">
                <li>
                  <span className="bw-check-ic" aria-hidden="true">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  <span>
                    <strong>Enterprise-Grade Security</strong> Military-grade encryption and blockchain immutability.
                  </span>
                </li>
                <li>
                  <span className="bw-check-ic" aria-hidden="true">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  <span>
                    <strong>User-Friendly Interface</strong> No blockchain knowledge required — simple as a wallet app.
                  </span>
                </li>
                <li>
                  <span className="bw-check-ic" aria-hidden="true">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  <span>
                    <strong>24/7 Customer Support</strong> Our team is always here to help you and your customers.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bw-section" id="why">
        <div className="bw-inner">
          <h2 className="bw-h2">Why Choose BlockWarranty?</h2>
          <p className="bw-sub">Join the revolution and provide your customers with unmatched warranty protection.</p>
          <div className="bw-grid-6">
            <article className="bw-mini-card">
              <div className="bw-icon-em" aria-hidden="true">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="8" r="6" />
                  <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
                </svg>
              </div>
              <h4>Increase Resale Value</h4>
              <p>Products with transferable warranties are worth more in the secondary market.</p>
            </article>
            <article className="bw-mini-card">
              <div className="bw-icon-em" aria-hidden="true">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M23 6l-9.5 9.5-5-5L1 18" />
                  <path d="M17 6h6v6" />
                </svg>
              </div>
              <h4>Reduce Fraud</h4>
              <p>Eliminate counterfeit warranties with verification and immutable records.</p>
            </article>
            <article className="bw-mini-card">
              <div className="bw-icon-em" aria-hidden="true">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <path d="M22 4L12 14.01l-3-3" />
                </svg>
              </div>
              <h4>Instant Verification</h4>
              <p>Service centers verify warranty status instantly, reducing wait times.</p>
            </article>
            <article className="bw-mini-card">
              <div className="bw-icon-em" aria-hidden="true">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15 15 0 0115 15" />
                </svg>
              </div>
              <h4>Global Coverage</h4>
              <p>Your warranty works anywhere — ideal for travelers and global businesses.</p>
            </article>
            <article className="bw-mini-card">
              <div className="bw-icon-em" aria-hidden="true">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </div>
              <h4>Privacy Protected</h4>
              <p>Personal data stays private while authenticity remains publicly verifiable.</p>
            </article>
            <article className="bw-mini-card">
              <div className="bw-icon-em" aria-hidden="true">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h4>Eco-Friendly</h4>
              <p>Go paperless and reduce environmental impact while improving warranty management.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="bw-section alt" id="testimonials">
        <div className="bw-inner">
          <h2 className="bw-h2">Trusted by Thousands</h2>
          <p className="bw-sub">See what our customers and partners are saying about BlockWarranty.</p>
          <div className="bw-testimonials">
            <blockquote className="bw-quote">
              <div className="bw-stars">★★★★★</div>
              <p>“We cut warranty disputes by half. Customers love scanning the QR at the counter.”</p>
              <div className="bw-author">
                <span className="bw-avatar" aria-hidden="true" />
                <div>
                  <strong>Sarah Chen</strong>
                  <span>Retail Operations Lead</span>
                </div>
              </div>
            </blockquote>
            <blockquote className="bw-quote featured">
              <div className="bw-stars">★★★★★</div>
              <p>“Finally a blockchain product that doesn’t feel like blockchain. Onboarding took one afternoon.”</p>
              <div className="bw-author">
                <span className="bw-avatar" aria-hidden="true" />
                <div>
                  <strong>Marcus Rodriguez</strong>
                  <span>CTO, FutureTech</span>
                </div>
              </div>
            </blockquote>
            <blockquote className="bw-quote">
              <div className="bw-stars">★★★★★</div>
              <p>“Resale value messaging at point of sale is a clear win. Support tickets dropped noticeably.”</p>
              <div className="bw-author">
                <span className="bw-avatar" aria-hidden="true" />
                <div>
                  <strong>Elena Volkov</strong>
                  <span>Channel Partner Manager</span>
                </div>
              </div>
            </blockquote>
          </div>
          <h2 className="bw-h2 bw-h2-spaced">Trusted by Leading Brands</h2>
          <p className="bw-sub">Join 500+ companies already protecting their products with blockchain.</p>
          <div className="bw-logo-strip" aria-label="Partner logos">
            {["TechCorp", "GlobalElectronics", "SmartDevices", "FutureTech", "ProGadgets", "NextGen", "InnoTech", "DigiWorld"].map(
              (x) => (
                <span key={x} className="bw-logo-pill">
                  {x}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="bw-section" id="get-started">
        <div className="bw-inner bw-signup-split">
          <div className="bw-signup-left">
            <h3>Start Protecting Your Products Today</h3>
            <p>Create your account in minutes and issue your first digital warranties.</p>
            <ul className="bw-check-list">
              <li>
                <span className="bw-check-ic" aria-hidden="true">
                  ✓
                </span>
                <span>Free account setup</span>
              </li>
              <li>
                <span className="bw-check-ic" aria-hidden="true">
                  ✓
                </span>
                <span>30-day free trial</span>
              </li>
              <li>
                <span className="bw-check-ic" aria-hidden="true">
                  ✓
                </span>
                <span>No credit card required</span>
              </li>
              <li>
                <span className="bw-check-ic" aria-hidden="true">
                  ✓
                </span>
                <span>Cancel anytime</span>
              </li>
            </ul>
          </div>
          <div className="bw-signup-form">
            <h4>Create Your Account</h4>
            <p className="bw-form-foot">
              Continue in the Sign in/Sign up page to connect your wallet and finish onboarding.
            </p>
            <button type="button" className="bw-submit-trial" onClick={() => onChangeView("auth")}>
              Start Free Trial <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </section>

      <section className="bw-section alt" id="pricing">
        <div className="bw-inner">
          <h2 className="bw-h2">Simple, Transparent Pricing</h2>
          <p className="bw-sub">Choose the plan that fits your business needs.</p>
          <div className="bw-pricing">
            <div className="bw-price-card">
              <h4>Starter</h4>
              <div className="bw-price">
                $99 <span className="bw-price-unit">/mo</span>
              </div>
              <ul className="bw-price-features">
                <li>Up to 100 warranties/month</li>
                <li>Basic analytics dashboard</li>
                <li>Email support</li>
                <li>QR code generation</li>
              </ul>
              <button type="button" className="bw-price-btn navy" onClick={() => onChangeView("auth")}>
                Get Started
              </button>
            </div>
            <div className="bw-price-card popular">
              <span className="bw-pop-badge">Most Popular</span>
              <h4>Professional</h4>
              <div className="bw-price">
                $299 <span className="bw-price-unit">/mo</span>
              </div>
              <ul className="bw-price-features">
                <li>Up to 1,000 warranties/month</li>
                <li>Priority support</li>
                <li>API access</li>
                <li>Custom branding</li>
              </ul>
              <button type="button" className="bw-price-btn emerald" onClick={() => onChangeView("auth")}>
                Get Started
              </button>
            </div>
            <div className="bw-price-card">
              <h4>Enterprise</h4>
              <div className="bw-price">Custom</div>
              <ul className="bw-price-features">
                <li>Unlimited warranties</li>
                <li>Full white-label solution</li>
                <li>Custom integrations</li>
                <li>SLA guarantee</li>
              </ul>
              <button type="button" className="bw-price-btn ghost" onClick={() => onChangeView("auth")}>
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bw-section" style={{ paddingTop: 0 }}>
        <div className="bw-cta-gradient">
          <h3>Ready to Get Started?</h3>
          <p>Join thousands of satisfied customers and businesses using BlockWarranty to protect valuable products.</p>
          <div className="bw-cta-btns">
            <button type="button" className="bw-cta-pill solid" onClick={() => onChangeView("admin")}>
              For Businesses →
            </button>
            <button type="button" className="bw-cta-pill outline" onClick={() => onChangeView("user")}>
              Individual wallet
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default HomePage;
