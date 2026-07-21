import { Phone, ShieldCheck, Flame, Snowflake } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />
      <Container className="relative grid grid-cols-1 items-center gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-ember-light">
            <ShieldCheck size={16} aria-hidden="true" />
            Serving Brampton & the GTA
          </p>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
            Heating & cooling problems, fixed by people who show up on time.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-white/80">
            No-heat and no-AC calls, honest quotes, and straight answers —
            from a local Brampton team, not a call centre.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/get-quote" size="lg">
              Get a Free Quote
            </Button>
            <Button href={site.phone.href} variant="outline-light" size="lg">
              <Phone size={20} aria-hidden="true" />
              {site.phone.display}
            </Button>
          </div>
        </div>

        <div className="relative mx-auto flex h-64 w-64 items-center justify-center sm:h-80 sm:w-80">
          <div className="absolute inset-0 rounded-full bg-white/5" />
          <div className="absolute inset-6 rounded-full border border-white/15" />
          <div className="absolute inset-14 rounded-full bg-ember/15" />
          <Flame
            size={72}
            className="absolute left-[22%] top-[24%] -translate-x-1/2 -translate-y-1/2 text-ember"
            aria-hidden="true"
          />
          <Snowflake
            size={72}
            className="absolute right-[20%] bottom-[22%] translate-x-1/2 translate-y-1/2 text-white/70"
            aria-hidden="true"
          />
        </div>
      </Container>
    </section>
  );
}
