import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Phone, Mail, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader, SiteFooter, PageIntro } from "@/components/clinic/site-layout";
import { services } from "@/lib/clinic-data";
import { friendlyError, getPrices, saveBooking, submitPaymentReference, UPI_ID, UPI_PAYEE } from "@/lib/physio-backend";
import { BookingReference } from "@/components/clinic/booking-reference";
import { parseSavedBooking, validatePatient, validateReference, type SavedBooking } from "@/lib/booking-validation";

export const Route = createFileRoute("/booking")({
  validateSearch: (s: Record<string, unknown>): { service?: string } => typeof s["service"] === "string" ? { service: s["service"] } : {},
  head: () => ({ meta: [
    { title: "Book a visit | Dr. Agrawal’s Physiotherapy Centre" },
    { name: "description", content: "Request a visit at Dr. Agrawal’s Physiotherapy Centre in Surat and pay by UPI with manual verification by clinic staff." },
    { property: "og:title", content: "Book a visit | Dr. Agrawal’s" },
    { property: "og:description", content: "Choose a service, share your contact details and pay by UPI. Clinic staff verify each payment manually." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Booking,
});

type Step = "details" | "pay" | "done";

function Booking() {
  const { service: initial } = Route.useSearch();
  const [serviceId, setServiceId] = useState(services.some(s => s.id === initial) ? initial! : "consultation");
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [priceState, setPriceState] = useState<"loading" | "live" | "fallback">("loading");
  const [step, setStep] = useState<Step>("details");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<SavedBooking | null>(null);
  const [reference, setReference] = useState("");
  const [done, setDone] = useState<SavedBooking | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    getPrices().then(rows => {
      const map: Record<string, number> = {};
      rows.forEach(r => { map[r.service] = Number(r.price); });
      setPrices(map); setPriceState(rows.length ? "live" : "fallback");
    }).catch(() => setPriceState("fallback"));
  }, []);
  useEffect(() => { heading.current?.focus(); }, [step]);
  useEffect(() => {
    let saved: SavedBooking | null = null;
    try { saved = parseSavedBooking(sessionStorage.getItem("physio-booking")); } catch { /* storage unavailable */ }
    if (saved) { setBooking(saved); setServiceId(saved.serviceId); setStep("pay"); }
  }, []);

  const service = services.find(s => s.id === serviceId) ?? services[0]!;
  // Once a request exists, show the amount recorded at creation, not a later fee change.
  const amount = booking?.amount ?? prices[serviceId] ?? service.price;

  async function submitDetails(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(null);
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") ?? "").trim(), email = String(f.get("email") ?? "").trim(), phone = String(f.get("phone") ?? "").trim();
    const invalid = validatePatient(name, email, phone);
    if (invalid) { setError(invalid); return; }
    setBusy(true);
    try {
      const row = await saveBooking({ patient_name: name, patient_email: email, patient_phone: phone, service: serviceId });
      const saved: SavedBooking = { ...row, serviceId, amount: prices[serviceId] ?? service.price };
      setBooking(saved); setStep("pay");
      try { sessionStorage.setItem("physio-booking", JSON.stringify(saved)); } catch { /* optional */ }
    } catch (err) { setError(friendlyError(err)); } finally { setBusy(false); }
  }

  function startOver() {
    try { sessionStorage.removeItem("physio-booking"); } catch { /* optional */ }
    setBooking(null); setReference(""); setError(null); setStep("details");
  }

  async function submitReference(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(null);
    const ref = reference.trim();
    const invalid = validateReference(ref);
    if (invalid) { setError(invalid); return; }
    if (!booking) { setError("Your booking session has expired. Please start a new request or call the clinic."); return; }
    setBusy(true);
    try { await submitPaymentReference(booking.id, booking.token, ref); setDone(booking); setStep("done"); try { sessionStorage.removeItem("physio-booking"); } catch { /* optional */ } }
    catch (err) { setError(friendlyError(err)); } finally { setBusy(false); }
  }

  const upiLink = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_PAYEE)}&am=${amount}&cu=INR`;

  return <><SiteHeader /><PageIntro eyebrow="Your next step" title="Let’s plan your first visit." description="Request a visit, pay by UPI, and the clinic will verify your payment and contact you to arrange a time." />
    <main id="main-content" tabIndex={-1} className="container booking-layout">
      <div className="booking-main booking-step">
        {step === "details" && <form onSubmit={submitDetails} noValidate>
          <h2 ref={heading} tabIndex={-1}>Your details</h2>
          <p>Appointment times are arranged with you by the clinic after your request. This form does not save a date or time.</p>
          <div className="form-grid">
            <label className="full-field"><span className="field-label">Service</span>
              <select className="form-control" value={serviceId} onChange={e => setServiceId(e.target.value)}>
                {services.map(s => <option key={s.id} value={s.id}>{s.name} — ₹{prices[s.id] ?? s.price}</option>)}
              </select></label>
            <label className="full-field"><span className="field-label">Full name</span><input className="form-control" name="name" autoComplete="name" required /></label>
            <label><span className="field-label">Email</span><input className="form-control" name="email" type="email" autoComplete="email" required /></label>
            <label><span className="field-label">Phone</span><input className="form-control" name="phone" type="tel" autoComplete="tel" required /></label>
          </div>
          {error && <p role="alert" className="form-error">{error}</p>}
          <Button type="submit" size="lg" disabled={busy}>{busy && <Loader2 className="animate-spin" />} Continue to payment</Button>
        </form>}

        {step === "pay" && <form onSubmit={submitReference} noValidate>
          <h2 ref={heading} tabIndex={-1}>Pay ₹{amount} by UPI</h2>
          {booking && <BookingReference id={booking.id} token={booking.token} status="pending" serviceName={service.name} amount={amount} />}
          <div className="payment-explanation"><h3><ShieldCheck /> How to pay</h3>
            <ol><li>Pay <strong>₹{amount}</strong> to UPI ID <strong>{UPI_ID}</strong> ({UPI_PAYEE}).</li><li>Copy the transaction reference (UTR) from your UPI app.</li><li>Enter it below. Staff check it manually — this is not automatic.</li></ol>
            <Button asChild variant="outline"><a href={upiLink}>Open UPI app</a></Button>
          </div>
          <label><span className="field-label">UPI transaction reference</span><input className="form-control" value={reference} onChange={e => setReference(e.target.value)} inputMode="text" autoComplete="off" required /></label>
          {error && <p role="alert" className="form-error">{error}</p>}
          <div className="hero-actions"><Button type="submit" size="lg" disabled={busy}>{busy && <Loader2 className="animate-spin" />} Submit reference</Button>
            <Button type="button" variant="outline" size="lg" onClick={startOver} disabled={busy}>Start a new request</Button></div>
        </form>}

        {step === "done" && <div>
          <h2 ref={heading} tabIndex={-1}>Payment submitted for verification</h2>
          <p>Payment submitted for verification — appointment still pending clinic confirmation. Your payment has <strong>not</strong> been confirmed yet; clinic staff check each reference manually and will contact you to agree a date and time.</p>
          {done && <BookingReference id={done.id} token={done.token} status="pending_verification" serviceName={service.name} amount={done.amount} />}
          <div className="hero-actions"><Button asChild variant="outline"><a href="tel:+917046507918"><Phone /> Call the clinic</a></Button></div>
        </div>}
      </div>
      <aside className="booking-summary"><span className="eyebrow">Your visit</span><h3>{service.name}</h3>
        <p>₹{amount}</p>
        <p className="small-note">{priceState === "loading" ? "Checking current fee…" : priceState === "live" ? "Current fee from the clinic system." : "Standard fee shown; the clinic will confirm the current fee."}</p>
        <p className="small-note">Near HDFC Bank, Delad Patiya, Sayan Oplad, Surat-394130 (Gujarat).</p>
        <p className="small-note"><a href="tel:+917046507918">+91-7046507918</a> · <a href="mailto:Dr.agrawalphysio@gmail.com"><Mail className="inline size-3" /> Email</a></p>
      </aside>
    </main><SiteFooter /></>;
}
