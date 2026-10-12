import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowUpRight, Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo-motion.png";
export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="Dr. Agrawal’s Physiotherapy Centre home">
      <span className="brand-symbol">
        <img src={logo} width={42} height={52} alt="" />
      </span>
      <span>
        <strong>Dr. Agrawal’s</strong>
        <small>PHYSIOTHERAPY CENTRE</small>
      </span>
    </Link>
  );
}
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="site-header" onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          menuButton.current?.focus();
        }
      }}>
        <div className="header-inner">
          <Brand />
          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="/#services">Our services</a>
            <a href="/#approach">Our approach</a>
            <a href="/#clinic">The clinic</a>
            <a href="/#contact">Contact</a>
          </nav>
          <div className="header-actions">
            <Button asChild size="lg">
              <Link to="/booking">
                Book an appointment <ArrowUpRight />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="mobile-menu"
              ref={menuButton}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        {open && (
          <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">
            {[
              ["Our services", "services"],
              ["Our approach", "approach"],
              ["The clinic", "clinic"],
              ["Contact", "contact"],
            ].map(([text, id]) => (
              <a key={id} href={`/#${id}`} onClick={() => setOpen(false)}>
                {text}
                <ArrowUpRight size={16} />
              </a>
            ))}
            <Link to="/booking" onClick={() => setOpen(false)}>
              Book an appointment <ArrowRight size={16} />
            </Link>
          </nav>
        )}
      </header>
    </>
  );
}
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div>
          <div className="footer-brand">
            <Brand />
          </div>
          <p>
            Thoughtful care.
            <br />A step towards better movement.
          </p>
        </div>
        <div>
          <h4>Explore</h4>
          <a href="/#services">Our services</a>
          <a href="/#approach">Our approach</a>
          <a href="/#clinic">The clinic</a>
        </div>
        <div>
          <h4>Your visit</h4>
          <Link to="/booking">Book an appointment</Link>
          <a href="/#faq">Common questions</a>
          <a href="/#contact">Location & contact</a>
        </div>
        <div>
          <h4>Clinic administration</h4>
          <Link to="/admin">
            Admin access <ArrowUpRight size={14} />
          </Link>
          <span className="footer-note">
            Online booking is currently unavailable.
            <br />
            Please call to arrange your visit.
          </span>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Dr. Agrawal’s Physiotherapy Centre</span>
        <span>Care starts with a conversation.</span>
      </div>
    </footer>
  );
}
export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-intro container">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
