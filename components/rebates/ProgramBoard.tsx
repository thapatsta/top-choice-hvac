import { Building2, ChevronDown, ExternalLink, Flag, Landmark } from "lucide-react";
import { RebateBars } from "@/components/rebates/RebateBars";
import {
  programsByStatus,
  REBATES_VERIFIED,
  type ProgramLevel,
  type ProgramStatus,
  type RebateProgram,
} from "@/data/rebates";

const STAMP: Record<ProgramStatus, { text: string; tone: string }> = {
  open: { text: "Open", tone: "border-success text-success" },
  announced: { text: "Announced", tone: "border-ember text-ember" },
  closed: { text: "Closed", tone: "border-muted text-muted" },
};

const LEVEL_ICON: Record<ProgramLevel, typeof Flag> = {
  Provincial: Landmark,
  Federal: Flag,
  Municipal: Building2,
};

function Stamp({ status }: { status: ProgramStatus }) {
  const s = STAMP[status];
  return (
    <span
      className={`inline-block shrink-0 rotate-[-4deg] rounded-md border-2 px-2 py-0.5 font-display text-[11px] font-extrabold uppercase tracking-[0.16em] sm:px-2.5 sm:text-xs ${s.tone}`}
    >
      {s.text}
    </span>
  );
}

function LevelBadge({ level }: { level: ProgramLevel }) {
  const Icon = LEVEL_ICON[level];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-navy">
      <Icon size={14} className="text-ember" aria-hidden="true" />
      {level}
    </span>
  );
}

function CardHeader({ program }: { program: RebateProgram }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <LevelBadge level={program.level} />
        <h3 className="mt-2 font-display text-xl font-bold leading-snug text-navy">
          {program.name}
        </h3>
        <p className="text-sm text-muted">{program.provider}</p>
      </div>
      <Stamp status={program.status} />
    </div>
  );
}

function HowToGet({ program }: { program: RebateProgram }) {
  if (program.howToGet.length === 0) return null;
  return (
    <details className="group border-t border-dashed border-border pt-2">
      <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-3 font-display font-semibold text-navy">
        How to get it
        <ChevronDown
          size={18}
          className="shrink-0 text-ember transition-transform duration-200 group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <ol className="mt-1 list-decimal space-y-1.5 pb-1 pl-5 text-sm text-navy/90">
        {program.howToGet.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
    </details>
  );
}

function SourceLink({ program }: { program: RebateProgram }) {
  return (
    <a
      href={program.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-ember hover:underline"
    >
      Official source: {program.sourceLabel}
      <ExternalLink size={14} aria-hidden="true" />
    </a>
  );
}

function WhoFor({ program }: { program: RebateProgram }) {
  return (
    <p className="text-sm text-muted">
      <span className="font-semibold text-navy">Who it&rsquo;s for: </span>
      {program.whoFor}
    </p>
  );
}

/** The program most visitors came for: wide, with the rebate drawn to scale. */
function FeaturedCard({ program }: { program: RebateProgram }) {
  return (
    <article className="rounded-2xl border-2 border-ember bg-card p-5 shadow-lg shadow-ember/10 sm:p-7">
      <CardHeader program={program} />
      <p className="mt-4 font-display text-3xl font-extrabold text-ember sm:text-4xl">
        {program.amount}
      </p>
      <div className="mt-4 grid gap-5 lg:grid-cols-2 lg:gap-x-8">
        <div className="flex flex-col gap-3">
          <p className="text-navy/90">{program.summary}</p>
          <WhoFor program={program} />
        </div>
        <div className="lg:row-span-2 lg:row-start-1 lg:col-start-2">
          <RebateBars />
        </div>
        <div className="flex flex-col gap-1">
          <HowToGet program={program} />
          <SourceLink program={program} />
        </div>
      </div>
    </article>
  );
}

function ProgramCard({ program }: { program: RebateProgram }) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <CardHeader program={program} />
      <p className="font-display text-2xl font-extrabold text-ember">{program.amount}</p>
      <p className="text-navy/90">{program.summary}</p>
      <WhoFor program={program} />
      <div className="mt-auto flex flex-col gap-1">
        <HowToGet program={program} />
        <SourceLink program={program} />
      </div>
    </article>
  );
}

export function ProgramBoard() {
  const open = programsByStatus("open");
  const announced = programsByStatus("announced");
  const closed = programsByStatus("closed");
  const featured = open.find((p) => p.id === "hrs");
  const otherOpen = open.filter((p) => p.id !== "hrs");

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-5" aria-label="Open programs">
        <p className="text-muted">
          Checked against each program&rsquo;s own page on {REBATES_VERIFIED}.
        </p>
        {featured && <FeaturedCard program={featured} />}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {otherOpen.map((p) => (
            <ProgramCard key={p.id} program={p} />
          ))}
        </div>
      </section>

      <details className="group rounded-2xl border border-border bg-card">
        <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-3 px-5 font-display text-lg font-bold text-navy">
          Not open yet, and closed programs ({announced.length + closed.length})
          <ChevronDown
            size={20}
            className="shrink-0 text-ember transition-transform duration-200 group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <div className="flex flex-col gap-5 border-t border-dashed border-border p-5">
          <p className="text-muted">
            These still rank on Google and turn up in old ads. None of them takes applications today.
          </p>
          {announced.map((p) => (
            <ProgramCard key={p.id} program={p} />
          ))}
          <ul className="divide-y divide-dashed divide-border rounded-2xl border border-border">
            {closed.map((p) => {
              const Icon = LEVEL_ICON[p.level];
              return (
                <li key={p.id} className="flex items-start gap-3 p-4 sm:items-center">
                  <Icon size={20} className="mt-0.5 shrink-0 text-muted sm:mt-0" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-base font-bold text-navy">{p.name}</p>
                    <p className="text-sm text-muted">{p.summary}</p>
                  </div>
                  <Stamp status="closed" />
                </li>
              );
            })}
          </ul>
        </div>
      </details>
    </div>
  );
}
