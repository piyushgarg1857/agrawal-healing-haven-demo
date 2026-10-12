import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter, PageIntro } from "@/components/clinic/site-layout";
export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [
    { title: "Admin access | Dr. Agrawal’s Physiotherapy Centre" },
    { name: "description", content: "Secure clinic administration. Access is unavailable until the existing backend is connected." },
    { property: "og:title", content: "Admin access | Dr. Agrawal’s" },
    { property: "og:description", content: "Clinic administration requires secure authentication and authorized access." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { name: "robots", content: "noindex,nofollow" },
  ] }), component: Admin,
});
function Admin() {
  return <><SiteHeader /><PageIntro eyebrow="Clinic administration" title="Admin access" description="Secure access to clinic bookings and price management." />
    <main id="main-content" tabIndex={-1} className="container section booking-step"><h2>Admin sign-in is currently unavailable.</h2><p>The existing clinic backend has not been linked to this project. No patient records are loaded, and no booking or payment status can be changed here. Continue using your existing admin site until integration is verified.</p></main><SiteFooter /></>;
}
