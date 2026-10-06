import { Download, Menu } from "lucide-react";
import Logo from "./logo";

const DesktopNavbar = () => {
  return (
    <header className="desktop-navbar">
      <div className="navbar-container">

        <Logo />

        <nav className="navbar-links">
          <a href="#features">Features</a>
          <a href="#services">Services</a>
          <a href="#security">Security</a>
          <a href="#about">About</a>
        </nav>

        <div className="navbar-actions">
          <a
            href="#download"
            className="download-button"
          >
            <Download size={17} />
            Download App
          </a>

          <button className="navbar-menu">
            <Menu size={23} />
          </button>
        </div>

      </div>
    </header>
  );
};

export default DesktopNavbar;