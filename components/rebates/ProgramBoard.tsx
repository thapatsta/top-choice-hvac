import { ChevronDown, ExternalLink } from "lucide-react";
import {
  programsByStatus,
  REBATES_VERIFIED,
  type ProgramStatus,
  type RebateProgram,
} from "@/data/rebates";

const STAMP: Record<ProgramStatus, { text: string; tone: string }> = {
  open: { text: "Open", tone: "border-success text-success" },
  announced: { text: "Announced", tone: "border-ember text-ember" },
  closed: { text: "Closed", tone: "border-muted text-muted" },
};

function Stamp({ status }: { status: ProgramStatus }) {
  const s = STAMP[status];
  return (
    <span
      className={`inline-block rotate-[-4deg] rounded-md border-2 px-2.5 py-0.5 font-display text-xs font-extrabold uppercase tracking-[0.18em] ${s.tone}`}
    >
      {s.text}
    </span>
  );
}

function ProgramCard({ program }: { program: RebateProgram }) {
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted">
            {program.level}
          </p>
          <h3 className="mt-1 font-display text-xl font-bold text-navy">{program.name}</h3>
          <p className="text-sm text-muted">{program.provider}</p>
        </div>
        <Stamp status={program.status} />
      </div>
      <p className="mt-4 font-display text-2xl font-extrabold text-ember">{program.amount}</p>
      <p className="mt-2 text-navy/90">{program.summary}</p>
      <p className="mt-3 text-sm text-muted">
        <span className="font-semibold text-navy">Who it&rsquo;s for: </span>
        {program.whoFor}
      </p>
      {program.howToGet.length > 0 && (
        <details className="group mt-4 border-t border-dashed border-border pt-3">
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-3 font-display font-semibold text-navy">
            How to get it
            <ChevronDown
              size={18}
              className="shrink-0 text-ember transition-transform duration-200 group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-navy/90">
            {program.howToGet.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </details>
      )}
      <a
        href={program.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-ember hover:underline"
      >
        Official source: {program.sourceLabel}
        <ExternalLink size={14} aria-hidden="true" />
      </a>
    </article>
  );
}

function Group({
  title,
  blurb,
  programs,
}: {
  title: string;
  blurb: string;
  programs: RebateProgram[];
}) {
  return (
    <div>
      <h3 className="font-display text-2xl font-bold text-navy">{title}</h3>
      <p className="mt-1 max-w-2xl text-muted">{blurb}</p>
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {programs.map((p) => (
          <ProgramCard key={p.id} program={p} />
        ))}
      </div>
    </div>
  );
}

export function ProgramBoard() {
  const open = programsByStatus("open");
  const announced = programsByStatus("announced");
  const closed = programsByStatus("closed");

  return (
    <div className="flex flex-col gap-12">
      <Group
        title="Open right now"
        blurb={`What you can actually use today. Checked against each program's own page on ${REBATES_VERIFIED}.`}
        programs={open}
      />
      <Group
        title="Announced, not open yet"
        blurb="In the news, but there's nothing to apply for. Don't delay a replacement you need on a promise."
        programs={announced}
      />
      <div>
        <h3 className="font-display text-2xl font-bold text-navy">
          Closed: stop searching for these
        </h3>
        <p className="mt-1 max-w-2xl text-muted">
          These still rank on Google and still turn up in old ads and blog posts. They no longer
          accept new applications.
        </p>
        <ul className="mt-5 divide-y divide-dashed divide-border rounded-2xl border border-border bg-card">
          {closed.map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
            >
              <div>
                <p className="font-display text-lg font-bold text-navy">{p.name}</p>
                <p className="text-sm text-muted">{p.summary}</p>
              </div>
              <Stamp status="closed" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
