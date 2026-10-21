import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Phone, Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button, buttonClasses } from "@/components/ui/Button";
import { PhoneLink, PhoneText } from "@/components/Phone";
import {
  CALLBACK_PROMISE,
  HOURS_LINE,
  INSTALL_PRICE_LINE,
  WARRANTY_LINE,
} from "@/content/cities/facts";
import { cityPath, formatLastReviewed, publishedCities } from "@/content/cities";
import type { CityContent, Issue, Job, Review } from "@/content/cities/types";
import {
  SERVICE_AREA_PATH,
  SERVICE_PAGE_PATHS,
  cityAnchor,
  cityBreadcrumbs,
  cityH1,
  cityJsonLd,
  jsonLdScript,
} from "@/lib/cityPages";

// The shared template for /service-area/<city>. It renders structure only:
// every local fact comes from the city's file in content/cities/. Everything
// here is a server component, so all text (issues, FAQ answers) is in the
// initial HTML. Section order follows the spec: hero, answer block, jobs,
// reviews, common problems, services, FAQ, quote CTA, other areas, freshness.

const SERVICE_LABEL: Record<Job["service"], string> = {
  "furnace-repair": "Furnace repair",
  "furnace-install": "Furnace installation",
  "ac-install": "AC installation",
};

const SEASON_LABEL: Record<Issue["season"], string> = {
  winter: "Mostly winter",
  summer: "Mostly summer",
  "year-round": "Year-round",
};

const h2 = "font-display text-2xl font-bold text-navy sm:text-3xl";
const h3 = "font-display text-lg font-bold text-navy";

function CallButton({ location, size = "lg" }: { location: string; size?: "md" | "lg" }) {
  return (
    <PhoneLink
      swap={false}
      trackLocation={location}
      ariaLabelPrefix="Call Top Choice HVAC at "
      className={buttonClasses("primary", size)}
    >
      <Phone size={20} aria-hidden="true" />
      Call <PhoneText swap={false} />
    </PhoneLink>
  );
}

function Breadcrumbs({ city }: { city: CityContent }) {
  const crumbs = cityBreadcrumbs(city);
  return (
    <nav aria-label="Breadcrumb" className="border-b border-border bg-card">
      <Container>
        <ol className="flex flex-wrap items-center gap-x-2 py-3 text-sm text-muted">
          {crumbs.map((crumb, i) => (
            <li key={crumb.path} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden="true">/</span>}
              {i === crumbs.length - 1 ? (
                <span aria-current="page" className="font-semibold text-navy">
                  {crumb.name}
                </span>
              ) : (
                <Link href={crumb.path} className="inline-flex min-h-[44px] items-center hover:text-ember hover:underline">
                  {crumb.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </Container>
    </nav>
  );
}

function JobPhotos({ job, city }: { job: Job; city: CityContent }) {
  const photos = job.photos ?? [];
  // PHOTO_SLOT: with no photos nothing renders (no image, no placeholder box).
  // Add entries to `photos` in the city's data file and drop the files in
  // public/images/cities/<city>/ to fill this. No template change needed.
  if (photos.length === 0) return null;
  const cols = photos.length === 1 ? "grid-cols-1" : photos.length === 2 ? "grid-cols-2" : "grid-cols-3";
  return (
    <ul className={`mb-4 grid gap-2 ${cols}`}>
      {photos.slice(0, 3).map((photo) => (
        <li key={photo.src}>
          <Image
            src={photo.src}
            alt={photo.alt || `${SERVICE_LABEL[job.service]} in ${job.neighbourhood}, ${city.name}`}
            width={800}
            height={600}
            loading="lazy"
            className="aspect-[4/3] h-auto w-full rounded-lg object-cover"
          />
        </li>
      ))}
    </ul>
  );
}

function JobCard({ job, city }: { job: Job; city: CityContent }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      {/* PHOTO_SLOT */}
      <JobPhotos job={job} city={city} />
      <p className="text-xs font-semibold uppercase tracking-wide text-ember">{SERVICE_LABEL[job.service]}</p>
      <h3 className={`${h3} mt-1`}>
        {job.neighbourhood}
        <span className="font-normal text-muted"> · {job.year}</span>
      </h3>
      <dl className="mt-3 space-y-3 text-sm">
        <div>
          <dt className="font-semibold text-navy">The problem</dt>
          <dd className="mt-0.5 text-muted">{job.problem}</dd>
        </div>
        <div>
          <dt className="font-semibold text-navy">What we did</dt>
          <dd className="mt-0.5 text-muted">{job.work}</dd>
        </div>
      </dl>
    </article>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-1">
        {Array.from({ length: review.stars }).map((_, i) => (
          <Star key={i} size={16} className="fill-ember text-ember" aria-hidden="true" />
        ))}
        <span className="sr-only">{review.stars} out of 5 stars</span>
      </div>
      <blockquote className="text-sm text-navy">{review.text}</blockquote>
      <figcaption className="text-xs font-semibold text-muted">
        {review.firstName}
        {review.date ? ` · ${formatMonth(review.date)}` : ""}
      </figcaption>
    </figure>
  );
}

function formatMonth(value: string): string {
  const date = new Date(`${value}-01T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-CA", { month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

function IssueBlock({ issue }: { issue: Issue }) {
  const emergencyLead = issue.emergency.is ? "Treat as urgent." : "Usually can wait for a scheduled visit.";
  return (
    <article className="rounded-2xl border border-border bg-card p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{SEASON_LABEL[issue.season]}</p>
      <h3 className={`${h3} mt-1`}>{issue.title}</h3>
      {/* Spec 6.4: show "who this affects" only where Robin or Patrick supplied it. */}
      {issue.appliesTo && (issue.source === "robin" || issue.source === "patrick") && (
        <p className="mt-2 text-sm text-muted">
          <span className="font-semibold text-navy">Who this affects: </span>
          {issue.appliesTo}.
        </p>
      )}
      <dl className="mt-3 space-y-3 text-sm">
        <div>
          <dt className="font-semibold text-navy">What you might notice</dt>
          <dd className="mt-0.5 text-muted">{issue.homeownerSays}</dd>
        </div>
        <div>
          <dt className="font-semibold text-navy">What&rsquo;s usually going on</dt>
          <dd className="mt-0.5 text-muted">{issue.whatsUsuallyGoingOn}</dd>
        </div>
        <div>
          <dt className="font-semibold text-navy">What we do</dt>
          <dd className="mt-0.5 text-muted">{issue.whatWeDo}</dd>
        </div>
        <div>
          <dt className="font-semibold text-navy">Repair or replace?</dt>
          <dd className="mt-0.5 text-muted">{issue.repairOrReplace}</dd>
        </div>
        <div>
          <dt className="font-semibold text-navy">When to call right away</dt>
          <dd className="mt-0.5 text-muted">
            {emergencyLead}
            {issue.emergency.note ? ` ${issue.emergency.note}` : ""}
          </dd>
        </div>
      </dl>
    </article>
  );
}

export function CityPage({ city }: { city: CityContent }) {
  const others = publishedCities().filter((c) => c.slug !== city.slug);
  const services = [
    { label: "Furnace repair", href: SERVICE_PAGE_PATHS.furnaceRepair, blurb: city.serviceBlurbs.furnaceRepair },
    { label: "Furnace installation", href: SERVICE_PAGE_PATHS.furnaceInstall, blurb: city.serviceBlurbs.furnaceInstall },
    { label: "AC installation", href: SERVICE_PAGE_PATHS.acInstall, blurb: city.serviceBlurbs.acInstall },
  ];
  const glance: [string, string][] = [
    ["Service area", `${city.name}, ${city.region}, and nearby`],
    ["Services", "Furnace repair, furnace installation, AC installation"],
    ["Hours", HOURS_LINE],
    ["Callback", `We ${CALLBACK_PROMISE.replace("usually within", "usually call back within")}`],
    ["Furnace installation", INSTALL_PRICE_LINE],
    ["Warranty", WARRANTY_LINE],
  ];

  return (
    <div data-city-page={city.name}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(cityJsonLd(city)) }} />

      <Breadcrumbs city={city} />

      <section data-track-location="city_hero" className="bg-navy py-12 text-white sm:py-16">
        <Container className="max-w-4xl">
          <h1 className="font-display text-3xl font-bold sm:text-5xl">{cityH1(city)}</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            Furnace repair, furnace installation and AC installation for {city.name} homes, with someone to call 24/7.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <CallButton location="city_hero" />
            <Button href="/get-quote" variant="outline-light" size="lg">
              Get a quote
            </Button>
          </div>
          <p className="mt-4 text-sm text-white/80">
            We call you back, usually within 15 minutes.
          </p>
        </Container>
      </section>

      <section aria-label={`About Top Choice HVAC in ${city.name}`} className="bg-card py-10">
        <Container className="max-w-4xl">
          <p className="text-lg text-navy">{city.answerBlock}</p>
          <h2 className="sr-only">At a glance</h2>
          <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-3 rounded-2xl border border-border bg-cream p-6 text-sm sm:grid-cols-2">
            {glance.map(([label, value]) => (
              <div key={label}>
                <dt className="font-semibold text-navy">{label}</dt>
                <dd className="text-muted">{value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container className="max-w-4xl">
          {city.isHomeBase && city.homeBaseParagraph && (
            <div className="mb-10 rounded-2xl border border-border bg-card p-6">
              <h2 className={h2}>Based in {city.name}</h2>
              <p className="mt-3 text-navy">{city.homeBaseParagraph}</p>
              <p className="mt-3">
                <Link href="/about" className="font-semibold text-ember hover:underline">
                  Read Robin&rsquo;s story
                </Link>
              </p>
            </div>
          )}
          <h2 className={h2}>Heating and cooling in {city.name}</h2>
          <p className="mt-3 text-navy">{city.introParagraph}</p>
          {city.neighbourhoodsServed.length > 0 && (
            <p className="mt-3 text-navy">
              Neighbourhoods we have worked in: {city.neighbourhoodsServed.join(", ")}.
            </p>
          )}
        </Container>
      </section>

      <section className="bg-card py-12 sm:py-16">
        <Container className="max-w-4xl">
          <h2 className={h2}>Recent jobs in {city.name}</h2>
          <p className="mt-3 text-navy">A few recent jobs we completed in {city.name}.</p>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {city.jobs.map((job, i) => (
              <JobCard key={i} job={job} city={city} />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container className="max-w-4xl">
          <h2 className={h2}>What {city.name} customers say</h2>
          <p className="mt-3 text-navy">
            These Google reviews come from {city.name} customers.{" "}
            <Link href="/reviews" className="font-semibold text-ember hover:underline">
              Read more reviews
            </Link>
            .
          </p>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {city.reviews.map((review, i) => (
              <ReviewCard key={i} review={review} />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-card py-12 sm:py-16">
        <Container className="max-w-4xl">
          <h2 className={h2}>Common heating and cooling problems we hear about in {city.name}</h2>
          <p className="mt-3 text-navy">{city.issuesIntro}</p>
          <div className="mt-6 flex flex-col gap-5">
            {city.issues.map((issue) => (
              <IssueBlock key={issue.title} issue={issue} />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container className="max-w-4xl">
          <h2 className={h2}>Furnace and AC services in {city.name}</h2>
          <p className="mt-3 text-navy">
            We do furnace repair, furnace installation and AC installation in {city.name}.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.href}
                href={service.href}
                className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className={h3}>{service.label}</h3>
                <p className="text-sm text-muted">{service.blurb}</p>
                <span className="mt-auto inline-flex min-h-[44px] items-center gap-1 text-sm font-semibold text-ember">
                  {service.label} in {city.name}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-card py-12 sm:py-16">
        <Container className="max-w-4xl">
          <h2 className={h2}>{city.name} furnace and AC questions</h2>
          <p className="mt-3 text-navy">
            Straight answers to what {city.name} homeowners ask us before they book.
          </p>
          <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-cream">
            {/* Native <details>: keyboard accessible, and every answer is in the HTML even when collapsed. */}
            {city.faqs.map((faq) => (
              <details key={faq.q} className="group p-5 sm:p-6">
                <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4">
                  <h3 className="font-display text-lg font-semibold text-navy">{faq.q}</h3>
                  <span aria-hidden="true" className="text-ember transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-muted">{faq.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section data-track-location="city_cta" className="bg-navy py-12 text-white sm:py-16">
        <Container className="flex max-w-4xl flex-col items-center gap-5 text-center">
          <h2 className="font-display text-3xl font-bold">Need a furnace or AC looked at in {city.name}?</h2>
          <p className="max-w-xl text-lg text-white/80">
            Call or send a quote request and we call you back, usually within 15 minutes. We are open 24/7.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <CallButton location="city_cta" />
            <Button href="/get-quote" variant="outline-light" size="lg">
              Get a quote
            </Button>
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container className="max-w-4xl">
          <h2 className={h2}>Other areas we serve</h2>
          <p className="mt-3 text-navy">
            We also work in{" "}
            {others.length > 0 ? (
              <>
                {others.map((other, i) => (
                  <span key={other.slug}>
                    {i > 0 && (i === others.length - 1 ? ", and " : ", ")}
                    <Link href={cityPath(other)} className="font-semibold text-ember hover:underline">
                      {cityAnchor(other, i)}
                    </Link>
                  </span>
                ))}
                .{" "}
              </>
            ) : null}
            See the full{" "}
            <Link href={SERVICE_AREA_PATH} className="font-semibold text-ember hover:underline">
              list of areas we cover
            </Link>
            .
          </p>
          <p className="mt-8 text-xs text-muted">Last reviewed {formatLastReviewed(city)}</p>
        </Container>
      </section>
    </div>
  );
}
