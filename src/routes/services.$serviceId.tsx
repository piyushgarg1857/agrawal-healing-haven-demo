import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ArrowUpRight } from "lucide-react";
import { services } from "@/lib/clinic-data";
import { SiteHeader, SiteFooter, PageIntro } from "@/components/clinic/site-layout";
import { Button } from "@/components/ui/button";
import hero from "@/assets/physio-hero.jpg";
export const Route = createFileRoute("/services/$serviceId")({
  head: ({ params }) => {
    const name = services.find((s) => s.id === params.serviceId)?.name ?? "Physiotherapy services";
    return {
      meta: [
        { title: `${name} | Dr. Agrawal’s Physiotherapy Centre` },
        {
          name: "description",
          content: `Explore the ${name.toLowerCase()} service and a personalised assessment at Dr. Agrawal’s Physiotherapy Centre.`,
        },
        { property: "og:title", content: `${name} | Dr. Agrawal’s` },
        {
          property: "og:description",
          content:
            "Individual care, attentive assessment and guided movement. Contact our Surat clinic to arrange your visit.",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ServicePage,
});
function ServicePage() {
  const { serviceId } = Route.useParams();
  const service = services.find((s) => s.id === serviceId);
  if (!service)
    return (
      <>
        <SiteHeader />
        <PageIntro
          eyebrow="Our services"
          title="Service not found"
          description="Please explore our available services."
        />
        <main id="main-content" tabIndex={-1} className="container section">
          <Button asChild>
            <Link to="/">Back to the clinic</Link>
          </Button>
        </main>
        <SiteFooter />
      </>
    );
  return (
    <>
      <SiteHeader />
      <PageIntro eyebrow="Our services" title={service.name} description={service.description} />
      <main id="main-content" tabIndex={-1} className="container service-detail">
        <div>
          <div className="service-price-note">
            Original listed fee: ₹{service.price.toLocaleString("en-IN")}
            <br />
            <span className="small-note">
              Current pricing must be confirmed with the clinic; live prices are not connected yet.
            </span>
          </div>
          <h2>
            Start with understanding.
            <br />
            Build a plan around you.
          </h2>
          <p>
            {service.short} The first step is an assessment of your concerns, relevant health
            history and current movement.
          </p>
          <ul>
            <li>
              <Check /> A conversation about your goals
            </li>
            <li>
              <Check /> An individual movement assessment
            </li>
            <li>
              <Check /> A proposed care plan explained clearly
            </li>
            <li>
              <Check /> Guidance for exercises when appropriate
            </li>
          </ul>
          <p>
            The suitability of treatment and any expected progress will be discussed following
            assessment. Outcomes vary between individuals.
          </p>
          <Button asChild size="lg">
            <Link to="/booking" search={{ service: service.id }}>
              Request an appointment <ArrowUpRight />
            </Link>
          </Button>
        </div>
        <div className="service-detail-photo">
          <img src={hero} alt="Illustrative physiotherapy assessment" width={1920} height={1088} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
