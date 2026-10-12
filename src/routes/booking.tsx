import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowLeft, ShieldCheck, Info, Check, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader, SiteFooter, PageIntro } from "@/components/clinic/site-layout";
import { services } from "@/lib/clinic-data";
export const Route = createFileRoute("/booking")({
  validateSearch: (s: Record<string, unknown>): { service?: string } =>
    typeof s["service"] === "string" ? { service: s["service"] } : {},
  head: () => ({
    meta: [
      { title: "Book an appointment | Dr. Agrawal’s Physiotherapy Centre" },
      {
        name: "description",
        content:
          "Explore a design-only appointment flow with service selection, illustrative pricing and manual UPI verification.",
      },
      { property: "og:title", content: "Your next step in care | Dr. Agrawal’s" },
      {
        property: "og:description",
        content:
          "An accessible appointment booking concept. No real booking or payment is collected.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Booking,
});
function Booking() {
  const search = Route.useSearch();
  const [serviceId, setServiceId] = useState(search.service ?? "pain-management");
  const [step, setStep] = useState(0);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [reference, setReference] = useState("");
  const [done, setDone] = useState(false);
  const stepHeading = useRef<HTMLDivElement>(null);
  const previousStage = useRef("0-false");
  useEffect(() => {
    const stage = `${step}-${done}`;
    if (previousStage.current !== stage) {
      stepHeading.current?.focus();
      previousStage.current = stage;
    }
  }, [step, done]);
  const service = services.find((s) => s.id === serviceId) ?? services[0];
  if (!service) return null;
  const dates: Array<[string, string]> = [
    ["Wed", "14"],
    ["Thu", "15"],
    ["Fri", "16"],
    ["Sat", "17"],
    ["Mon", "19"],
  ];
  const times = ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "03:00 PM", "04:00 PM"];
  return (
    <>
      <SiteHeader />
      <PageIntro
        eyebrow="Your next step"
        title={done ? "A thoughtful start to your care." : "Let’s plan your first visit."}
        description="Choose the care you need, find a suitable time, and share a few details."
      />
      <main id="main-content" tabIndex={-1} className="container booking-layout">
        <div className="booking-main">
          <div className="demo-notice">
            <Info />
            <span>
              <strong>Design preview only.</strong> Slots and prices are illustrative. Nothing is
              sent or saved, and no payment is collected. Please use fictional contact details.
            </span>
          </div>
          {done ? (
            <div className="confirmation" ref={stepHeading} tabIndex={-1} aria-live="polite">
              <div className="confirmation-icon">
                <Check />
              </div>
              <h2>Demo request prepared.</h2>
              <p>
                Thank you, {name}. Your appointment request for {service.name.toLowerCase()} is
                shown below. No real booking has been made.
              </p>
              <span className="confirmation-state">
                {reference
                  ? "Demo payment awaiting manual review"
                  : "Demo appointment awaiting confirmation"}
              </span>
              <p>
                {date} October 2026 · {time}
                <br />
                Reference: DEMO-1043
              </p>
              <p className="small-note">
                In the proposed live flow, clinic staff would verify availability and any UPI
                transaction before confirming your appointment.
              </p>
              <Button asChild variant="outline">
                <Link to="/">
                  Back to the clinic <ArrowRight />
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="stepper" aria-label="Booking progress">
                {["Service", "Date & time", "Your details", "Review"].map((s, i) => (
                  <div
                    key={s}
                    className={`stepper-item ${i <= step ? "active" : ""}`}
                    aria-current={step === i ? "step" : undefined}
                  >
                    <span>{i < step ? <Check size={12} /> : i + 1}</span>
                    {s}
                  </div>
                ))}
              </div>
              <div className="booking-step" ref={stepHeading} tabIndex={-1}>
                {step === 0 && (
                  <>
                    <h2>What can we help you with?</h2>
                    <p>Choose a service. Your care plan will follow an individual assessment.</p>
                    <div className="service-options">
                      {services.map((s) => (
                        <Button
                          variant="ghost"
                          key={s.id}
                          className={`service-option ${serviceId === s.id ? "selected" : ""}`}
                          aria-pressed={serviceId === s.id}
                          onClick={() => setServiceId(s.id)}
                        >
                          <s.icon />
                          <span>
                            <strong>{s.name}</strong>
                            <small>
                              {s.duration} min · ₹{s.price.toLocaleString("en-IN")}{" "}
                              <span>— demo price</span>
                            </small>
                          </span>
                        </Button>
                      ))}
                    </div>
                    <div className="booking-actions">
                      <span>All prices are illustrative.</span>
                      <Button size="lg" onClick={() => setStep(1)}>
                        Choose a time <ArrowRight />
                      </Button>
                    </div>
                  </>
                )}
                {step === 1 && (
                  <>
                    <h2>Find a time that suits you.</h2>
                    <p>October 2026 · All times are in India Standard Time (IST).</p>
                    <span className="field-label">Choose a date · demo availability</span>
                    <div className="date-grid">
                      {dates.map(([day, d]) => (
                        <Button
                          variant="outline"
                          key={d}
                          className={`date-option ${date === d ? "selected-control" : ""}`}
                          aria-pressed={date === d}
                          onClick={() => {
                            setDate(d);
                            setTime("");
                          }}
                          aria-label={`${day} ${d} October 2026`}
                        >
                          <span>{day}</span>
                          <strong>{d}</strong>
                          <span>Oct</span>
                        </Button>
                      ))}
                    </div>
                    <span className="field-label">Choose a time</span>
                    <div className="time-grid">
                      {times.map((t) => (
                        <Button
                          variant="outline"
                          key={t}
                          disabled={!date}
                          className={time === t ? "selected-control" : ""}
                          aria-pressed={time === t}
                          onClick={() => setTime(t)}
                        >
                          {t}
                        </Button>
                      ))}
                    </div>
                    <div className="booking-actions">
                      <Button variant="ghost" onClick={() => setStep(0)}>
                        <ArrowLeft /> Back
                      </Button>
                      <Button size="lg" disabled={!date || !time} onClick={() => setStep(2)}>
                        Your details <ArrowRight />
                      </Button>
                    </div>
                  </>
                )}
                {step === 2 && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setStep(3);
                    }}
                  >
                    <h2>A little about you.</h2>
                    <p>Please use fictional details in this design preview.</p>
                    <div className="form-grid">
                      <label>
                        <span className="field-label">Full name *</span>
                        <input
                          className="form-control"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          maxLength={80}
                          placeholder="Demo patient"
                          autoComplete="off"
                        />
                      </label>
                      <label>
                        <span className="field-label">Mobile number *</span>
                        <input
                          className="form-control"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          pattern="[0-9 +()-]{10,16}"
                          placeholder="Fictional 10-digit number"
                          autoComplete="off"
                        />
                      </label>
                      <label className="full-field">
                        <span className="field-label">Email address (optional)</span>
                        <input
                          className="form-control"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="demo@example.com"
                          autoComplete="off"
                        />
                      </label>
                      <label className="full-field">
                        <span className="field-label">
                          Anything you’d like us to know? (optional)
                        </span>
                        <textarea
                          className="form-control"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Share fictional movement goals — not real health information."
                          maxLength={500}
                        />
                      </label>
                    </div>
                    <label className="consent">
                      <input
                        type="checkbox"
                        required
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                      />
                      <span>
                        I understand this is a design preview, and I am using fictional information.
                        No appointment will be booked.
                      </span>
                    </label>
                    <div className="booking-actions">
                      <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                        <ArrowLeft /> Back
                      </Button>
                      <Button type="submit" size="lg">
                        Review request <ArrowRight />
                      </Button>
                    </div>
                  </form>
                )}
                {step === 3 && (
                  <>
                    <h2>Everything clear before you continue.</h2>
                    <p>Review your demo appointment and the proposed payment process.</p>
                    <div className="summary-line">
                      <span>Name</span>
                      <strong>{name}</strong>
                    </div>
                    <div className="summary-line">
                      <span>Mobile</span>
                      <strong>{phone}</strong>
                    </div>
                    {email && (
                      <div className="summary-line">
                        <span>Email</span>
                        <strong>{email}</strong>
                      </div>
                    )}
                    {notes && (
                      <div className="summary-line">
                        <span>Movement goals</span>
                        <strong>{notes}</strong>
                      </div>
                    )}
                    <div className="payment-explanation">
                      <h3>
                        <Smartphone size={19} /> UPI & manual verification
                      </h3>
                      <ol>
                        <li>In a live flow, pay the stated fee to the clinic’s verified UPI ID.</li>
                        <li>Share the transaction reference with your appointment request.</li>
                        <li>Clinic staff check the transaction and appointment availability.</li>
                        <li>Confirmation follows review — not simply submission.</li>
                      </ol>
                      <div className="payment-disabled">
                        Payment is disabled in this preview. No UPI ID, QR code or payment link is
                        provided.
                      </div>
                    </div>
                    <label>
                      <span className="field-label">Demo transaction reference (optional)</span>
                      <input
                        className="form-control"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        placeholder="e.g. DEMO-UPI-1043"
                        maxLength={40}
                      />
                    </label>
                    <p className="small-note">
                      Do not enter a real transaction reference. Leave blank to preview an unpaid
                      request.
                    </p>
                    <div className="booking-actions">
                      <Button variant="ghost" onClick={() => setStep(2)}>
                        <ArrowLeft /> Back
                      </Button>
                      <Button size="lg" onClick={() => setDone(true)}>
                        Preview request <ArrowRight />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
        <aside className="booking-summary">
          <span className="eyebrow">Your visit</span>
          <h3>Appointment summary</h3>
          <div className="summary-line">
            <span>Service</span>
            <strong>{service.name}</strong>
          </div>
          <div className="summary-line">
            <span>Duration</span>
            <strong>{service.duration} minutes</strong>
          </div>
          <div className="summary-line">
            <span>Date</span>
            <strong>{date ? `${date} Oct 2026` : "Not selected"}</strong>
          </div>
          <div className="summary-line">
            <span>Time</span>
            <strong>{time || "Not selected"}</strong>
          </div>
          <div className="summary-total">
            <span>Illustrative total</span>
            <strong>₹{service.price.toLocaleString("en-IN")}</strong>
          </div>
          <p className="small-note">
            Demo fee only. No additional charge is shown in this concept. Final fees and tax
            treatment require clinic confirmation.
          </p>
          <div className="summary-safety">
            <ShieldCheck />
            <span>Your appointment and payment would be confirmed only after clinic review.</span>
          </div>
        </aside>
      </main>
      <SiteFooter />
    </>
  );
}
