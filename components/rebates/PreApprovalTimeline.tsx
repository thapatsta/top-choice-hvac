const STEPS: { who: "You" | "Us" | "Program"; title: string; body: string }[] = [
  {
    who: "You",
    title: "Call us before you sign anything",
    body: "We check your heating fuel and tell you straight away whether a rebate applies, then book a free in-home assessment.",
  },
  {
    who: "Program",
    title: "We get written approval",
    body: "We submit the pre-approval for you. No work starts until it comes back. Installs done before approval don't qualify.",
  },
  {
    who: "Us",
    title: "We install and file the rest",
    body: "We handle the post-install paperwork. The cheque is mailed to you, within about 60 days of final approval.",
  },
];

const WHO_TONE = {
  You: "bg-navy text-white",
  Us: "bg-ember text-white",
  Program: "bg-cream text-navy border border-border",
} as const;

export function PreApprovalTimeline() {
  return (
    <ol className="relative flex flex-col gap-0">
      {STEPS.map((s, i) => (
        <li key={s.title} className="relative flex gap-4 pb-8 last:pb-0 sm:gap-6">
          {i < STEPS.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute left-[19px] top-10 bottom-0 w-0.5 border-l-2 border-dashed border-ember/50"
            />
          )}
          <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ember font-display font-extrabold text-white">
            {i + 1}
          </span>
          <div className="pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-lg font-bold text-navy">{s.title}</h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${WHO_TONE[s.who]}`}
              >
                {s.who}
              </span>
            </div>
            <p className="mt-1 max-w-xl text-muted">{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
