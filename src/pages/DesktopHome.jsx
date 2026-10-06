import {
  ArrowRight,
  Download,
  ShieldCheck,
  Send,
  Building2,
  CreditCard
} from "lucide-react";

import DesktopNavbar from "../components/DesktopNavbar";
import Logo from "../components/logo";

const DesktopHome = ({ setPage}) => {

  return (
    <main className="desktop-home">

      <DesktopNavbar />

      {/* HERO */}

      <section className="hero" id="about">

        <div className="hero-content">

          <div className="hero-text">

            <span className="hero-label">
              THE FUTURE OF DIGITAL PAYMENTS
            </span>

            <h1>
              Welcome to
              <span> CheqPay.</span>
            </h1>

            <p>
              A smarter and simpler way to send,
              receive and manage your money.
              Everything you need for everyday
              payments, right from your phone.
            </p>

            <div className="hero-buttons">

              <a
                href="#download"
                className="play-store-button"
              >

                <Download size={22} />

                <div>
                  <small>
                    GET IT ON
                  </small>

                  <strong>
                    Google Play
                  </strong>
                </div>

              </a>

              <a
                href="#features"
                className="explore-button"
              >
                Explore CheqPay
                <ArrowRight size={18} />
              </a>

            </div>

            <div className="hero-security">

              <ShieldCheck size={19} />

              Secure and convenient
              digital payments

            </div>

          </div>

          <div className="hero-brand">

            <div className="hero-logo-container">
              <Logo />
            </div>

            <div className="hero-orb orb-one"></div>
            <div className="hero-orb orb-two"></div>

          </div>

        </div>

      </section>

      {/* FEATURES */}

      <section
        className="desktop-features"
        id="features"
      >

        <div className="section-title">

          <span>
            CHEQPAY FEATURES
          </span>

          <h2>
            Everything in one place.
          </h2>

          <p>
            Manage your everyday financial
            activities from one simple platform.
          </p>

        </div>

        <div className="feature-grid">

          <Feature
            icon={<Send />}
            title="Send Money"
            text="Send money quickly to other CheqPay users."
          />

          <Feature
            icon={<Building2 />}
            title="Bank Transfer"
            text="Transfer funds to supported bank accounts."
          />

          <Feature
            icon={<CreditCard />}
            title="Digital Payments"
            text="Pay for your everyday services."
          />

        </div>

      </section>

      {/* DOWNLOAD */}

      <section
        className="download-section"
        id="download"
      >

        <div>

          <span>
            DOWNLOAD CHEQPAY
          </span>

          <h2>
            Your money.
            <br />
            Your phone.
            <br />
            Your CheqPay.
          </h2>

          <p>
            Download the CheqPay Android app
            for the full mobile experience.
          </p>

          <a
            href="#"
            className="play-store-button"
          >

            <Download size={22} />

            <div>

              <small>
                GET IT ON
              </small>

              <strong>
                Google Play
              </strong>

            </div>

          </a>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="desktop-footer">

        <Logo />

        <p>
          © 2026 CheqPay. All rights reserved.
        </p>

      </footer>

    </main>
  );
};

const Feature = ({
  icon,
  title,
  text
}) => {

  return (
    <article className="feature-card">

      <div className="feature-icon">
        {icon}
      </div>

      <h3>
        {title}
      </h3>

      <p>
        {text}
      </p>

      <a href="#download">
        Learn more →
      </a>

    </article>
  );
};

export default DesktopHome;