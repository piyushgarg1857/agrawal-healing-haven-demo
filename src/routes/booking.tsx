import { createFileRoute } from "@tanstack/react-router";
import { Phone, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader, SiteFooter, PageIntro } from "@/components/clinic/site-layout";
import { services } from "@/lib/clinic-data";
export const Route = createFileRoute("/booking")({
  validateSearch: (s: Record<string, unknown>): { service?: string } => typeof s.service === "string" ? { service: s.service } : {},
  head: () => ({ meta: [
    { title: "Arrange your visit | Dr. Agrawal’s Physiotherapy Centre" },
    { name: "description", content: "Contact Dr. Agrawal’s Physiotherapy Centre to arrange your visit. Online booking is currently unavailable." },
    { property: "og:title", content: "Arrange your visit | Dr. Agrawal’s" },
    { property: "og:description", content: "Call or email our Surat clinic to confirm your appointment and current fees." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Booking,
});
function Booking() {
  const { service: id } = Route.useSearch();
  const service = services.find(s => s.id === id);
  return <><SiteHeader /><PageIntro eyebrow="Your next step" title="Let’s plan your first visit." description="Contact the clinic to discuss your care and arrange a suitable appointment." />
    <main id="main-content" tabIndex={-1} className="container booking-layout">
      <div className="booking-main booking-step">
        <h2>Online booking is currently unavailable.</h2>
        <p>No appointment has been created. Please contact the clinic directly to confirm scheduling, current fees and payment instructions.</p>
        <div className="hero-actions">
          <Button asChild size="lg"><a href="tel:+917046507918"><Phone /> Call the clinic</a></Button>
          <Button asChild variant="outline"><a href="mailto:Dr.agrawalphysio@gmail.com"><Mail /> Email the clinic</a></Button>
        </div>
        <div className="payment-explanation"><h3><ShieldCheck /> Payment confirmation</h3><p>UPI payments require manual verification by clinic staff. Do not pay until the clinic confirms your request and instructions. No transaction reference can be submitted here yet.</p></div>
      </div>
      <aside className="booking-summary"><span className="eyebrow">Your visit</span><h3>{service?.name ?? "Clinic contact"}</h3><p>+91-7046507918</p><p className="small-note">Near HDFC Bank, Delad Patiya, Sayan Oplad, Surat-394130 (Gujarat).</p><p className="small-note">Appointments are arranged with the clinic. This page does not save scheduling information.</p></aside>
    </main><SiteFooter /></>;
}
