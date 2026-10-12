import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  HeartHandshake,
  Leaf,
  ClipboardList,
  Plus,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader, SiteFooter } from "@/components/clinic/site-layout";
import { services, faqs } from "@/lib/clinic-data";
import hero from "@/assets/physio-hero.jpg";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dr. Agrawal’s Physiotherapy Centre | Thoughtful care, better movement" },
      {
        name: "description",
        content:
          "Physiotherapy services at Dr. Agrawal’s Physiotherapy Centre in Surat. Contact the clinic to arrange your visit.",
      },
      { property: "og:title", content: "Dr. Agrawal’s Physiotherapy Centre" },
      {
        property: "og:description",
        content:
          "Physiotherapy services and clinic contact information in Surat, Gujarat.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});
function Index() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <section className="hero">
          <img
            className="hero-image"
            src={hero}
            width={1920}
            height={1088}
            alt="Illustrative physiotherapist guiding a patient through a knee mobility assessment"
          />
          <div className="container hero-content">
            <span className="eyebrow">Care that puts you first</span>
            <h1>
              Dr. Agrawal’s
              <span>Physiotherapy<br />Centre.</span>
            </h1>
            <p className="hero-description">
              Your movement. Your confidence. Our care. A thoughtful approach that starts with
              listening — and a plan shaped around you.
            </p>
            <div className="hero-actions">
              <Button asChild size="lg" className="hero-main">
                <Link to="/booking">
                  Book an appointment <ArrowUpRight />
                </Link>
              </Button>
              <a href="#services">
                Explore our services <ArrowRight size={16} />
              </a>
            </div>
            <div className="hero-reassurance">
              <span>
                <Check size={13} /> Individualised care
              </span>
              <span>
                <Check size={13} /> A guided recovery journey
              </span>
            </div>
          </div>
          <span className="photo-label">Illustrative clinic imagery</span>
        </section>
        <section className="care-band" aria-label="Our care principles">
          <div className="container care-band-inner">
            <div className="care-band-lead">
              A little more care.
              <br />
              At every step.
            </div>
            {[
              [HeartHandshake, "You, at the centre", "Care shaped around your needs"],
              [ClipboardList, "A clear path forward", "Assessment before treatment"],
              [Leaf, "Progress at your pace", "Support for everyday movement"],
            ].map(([Icon, title, desc]) => {
              const I = Icon as typeof Leaf;
              return (
                <div className="care-band-item" key={String(title)}>
                  <I />
                  <div>
                    <strong>{String(title)}</strong>
                    <p>{String(desc)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <section className="section" id="services">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Our services</span>
                <h2>
                  Care for the way
                  <br />
                  you want to move.
                </h2>
              </div>
              <p>
                From everyday discomfort to a return to activity, discover care tailored to your
                movement needs.
              </p>
            </div>
            <div className="service-grid">
              {services.map((s, i) => (
                <Link
                  className="service-card"
                  to="/services/$serviceId"
                  params={{ serviceId: s.id }}
                  key={s.id}
                >
                  <div className="service-icon">
                    <s.icon />
                  </div>
                  <span className="service-number">0{i + 1}</span>
                  <h3>{s.name}</h3>
                  <p>{s.short}</p>
                  <span className="text-link">
                    Explore care <ArrowUpRight />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
        <section className="section approach-section" id="approach">
          <div className="container">
            <div className="approach-head">
              <div>
                <span className="eyebrow">Your care journey</span>
                <h2>
                  One step at a time.
                  <br />
                  Together.
                </h2>
              </div>
              <p>
                A thoughtful process that helps you understand your care, feel supported, and take
                the next step with clarity.
              </p>
            </div>
            <div className="journey-grid">
              {[
                [
                  "Listen & understand",
                  "We start with your story, your concerns and what you want to get back to doing.",
                ],
                [
                  "Assess & personalise",
                  "A movement assessment helps shape a care plan that fits your individual needs.",
                ],
                [
                  "Guide & support",
                  "Your sessions and home exercises evolve with you, with space for questions along the way.",
                ],
              ].map(([title, desc], i) => (
                <div className="journey-step" key={title}>
                  <div className="step-number">
                    0{i + 1}
                    <ArrowRight size={18} />
                  </div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="section" id="clinic">
          <div className="container clinic-grid">
            <div className="clinic-photo">
              <img
                src={hero}
                width={1920}
                height={1088}
                loading="lazy"
                alt="Illustrative hands-on physiotherapy session in a bright clinic"
              />
              <span className="photo-label">Illustrative imagery · not the actual team</span>
            </div>
            <div className="clinic-copy">
              <span className="eyebrow">Dr. Agrawal’s Physiotherapy Centre</span>
              <h2>
                Good care starts
                <br />
                with understanding.
              </h2>
              <p>
                You’re more than a symptom. Your routine, your goals, and the things that matter to
                you all belong in the conversation.
              </p>
              <p>
                Our care approach brings together attentive assessment, a personalised
                plan, and clear guidance for your next steps.
              </p>
              <div className="clinic-values">
                <div>
                  <Check /> A plan shaped around your daily life
                </div>
                <div>
                  <Check /> Space to ask questions and understand your care
                </div>
                <div>
                  <Check /> Guidance for movement beyond the clinic
                </div>
              </div>
              <Button asChild variant="outline">
                <Link to="/booking">
                  Let’s talk about your care <ArrowUpRight />
                </Link>
              </Button>
              <p className="small-note">
                Contact the clinic to discuss your needs and arrange a visit.
              </p>
            </div>
          </div>
        </section>
        <section className="section" id="faq">
          <div className="container faq-grid">
            <div className="faq-copy">
              <span className="eyebrow">Before your visit</span>
              <h2>
                A few questions.
                <br />A little more clarity.
              </h2>
              <p>It’s natural to have questions before getting started.</p>
              <a href="#contact" className="text-link">
                Have another question? Get in touch <ArrowUpRight />
              </a>
            </div>
            <div className="faq-list">
              {faqs.map(([q, a]) => (
                <details key={q}>
                  <summary>
                    {q}
                    <Plus />
                  </summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
        <section className="section contact-section" id="contact">
          <div className="container contact-grid">
            <div className="contact-copy">
              <span className="eyebrow">Your next step</span>
              <h2>
                Let’s make room
                <br />
                for better movement.
              </h2>
              <p>
                Start with a conversation about your needs. We’ll help you find the right next step.
              </p>
              <Button asChild variant="secondary" size="lg">
                <Link to="/booking">
                  Book an appointment <ArrowUpRight />
                </Link>
              </Button>
            </div>
            <div className="contact-info">
              <div>
                <MapPin />
                <div>
                  <strong>Visit the centre</strong>
                  <p>Dr. Agrawal’s Physiotherapy Centre</p>
                  <small>Near HDFC Bank, Delad Patiya, Sayan Oplad, Surat-394130 (Gujarat).</small>
                </div>
              </div>
              <div>
                <Phone />
                <div>
                  <strong>Speak to the clinic</strong>
                  <p><a href="tel:+917046507918">+91-7046507918</a></p>
                  <small>Call to arrange your visit.</small>
                </div>
              </div>
              <div>
                <Mail />
                <div>
                  <strong>Email the clinic</strong>
                  <p><a href="mailto:Dr.agrawalphysio@gmail.com">Dr.agrawalphysio@gmail.com</a></p>
                  <small>Contact the clinic to confirm appointment times.</small>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
