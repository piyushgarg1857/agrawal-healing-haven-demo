import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader, SiteFooter, PageIntro } from "@/components/clinic/site-layout";
import { services } from "@/lib/clinic-data";
import { describeStatus } from "@/lib/booking-status";
import { friendlyError, getBookingStatus, type PublicStatus } from "@/lib/physio-backend";

export const Route = createFileRoute("/booking-status")({
  head: () => ({ meta: [
    { title: "Check booking status | Dr. Agrawal’s Physiotherapy Centre" },
    { name: "description", content: "Check whether your booking request and UPI payment have been verified by Dr. Agrawal’s Physiotherapy Centre." },
    { property: "og:title", content: "Check booking status | Dr. Agrawal’s" },
    { property: "og:description", content: "Use your private status code to see your booking's current status." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { name: "robots", content: "noindex" },
  ] }), component: BookingStatusPage,
});

function BookingStatusPage() {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PublicStatus | null | undefined>(undefined);
  const out = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (result !== undefined) out.current?.focus(); }, [result]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault(); setError(null); setResult(undefined);
    const token = code.trim();
    if (token.length < 16) { setError("Enter the full status code shown after you booked."); return; }
    setBusy(true);
    try { setResult(await getBookingStatus(token)); } catch (err) { setError(friendlyError(err)); } finally { setBusy(false); }
  }

  const info = result ? describeStatus(result.status, result.appointment_confirmed) : null;
  return <><SiteHeader /><PageIntro eyebrow="Your booking" title="Check your booking status." description="Enter the private status code you received after booking. No personal details are shown." />
    <main id="main-content" tabIndex={-1} className="container booking-layout">
      <div className="booking-main booking-step">
        <form onSubmit={onSubmit} noValidate>
          <label className="full-field"><span className="field-label">Status code</span>
            <input className="form-control" value={code} onChange={e => setCode(e.target.value)} autoComplete="off" spellCheck={false} required /></label>
          {error && <p role="alert" className="form-error">{error}</p>}
          <Button type="submit" size="lg" disabled={busy}>{busy && <Loader2 className="animate-spin" />} Check status</Button>
        </form>
        {result === null && <div><h2 ref={out} tabIndex={-1}>No booking found</h2><p>Check the code and try again, or call the clinic.</p></div>}
        {result && info && <div className="payment-explanation booking-reference">
          <h2 ref={out} tabIndex={-1}>{info.label}</h2>
          <p className="status-pill" data-tone={info.tone}><strong>{info.label}</strong></p>
          <p>{info.message}</p>
          <dl className="reference-list">
            <div><dt>Service</dt><dd>{services.find(s => s.id === result.service)?.name ?? result.service}</dd></div>
            <div><dt>Fee</dt><dd>₹{result.amount}</dd></div>
            <div><dt>Requested</dt><dd>{new Date(result.created_at).toLocaleDateString("en-IN")}</dd></div>
            <div><dt>Payment reference</dt><dd>{result.payment_submitted ? "Submitted" : "Not submitted"}</dd></div>
          </dl>
        </div>}
      </div>
      <aside className="booking-summary"><span className="eyebrow">Need help?</span><h3>Call the clinic</h3>
        <p className="small-note">Appointment times are agreed with you by phone. This page never shows a time slot.</p>
        <div className="hero-actions"><Button asChild variant="outline"><a href="tel:+917046507918"><Phone /> +91-7046507918</a></Button></div>
        <p className="small-note"><Link to="/booking">Make a new booking request</Link></p>
      </aside>
    </main><SiteFooter /></>;
}
