const STEPS: { who: "You" | "Us" | "Program"; title: string; body: string }[] = [
  {
    who: "You",
    title: "Call or request a free quote",
    body: "Tell us your heating fuel and what you're replacing. We tell you straight away whether a rebate applies.",
  },
  {
    who: "Us",
    title: "Free in-home assessment",
    body: "We size the system, photograph your existing equipment and nameplates, and put together the work order.",
  },
  {
    who: "Us",
    title: "We submit the pre-approval",
    body: "Your signed participant agreement and our sizing paperwork go to the program. No work starts yet.",
  },
  {
    who: "Program",
    title: "Written approval",
    body: "Installs done before approval don't qualify. This is the step people lose their rebate on.",
  },
  {
    who: "Us",
    title: "Installation, then final paperwork",
    body: "We install, then submit the post-installation application with invoices and photos within 30 days.",
  },
  {
    who: "Program",
    title: "Cheque in the mail",
    body: "After final approval the rebate cheque is mailed to you, within about 60 days.",
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
