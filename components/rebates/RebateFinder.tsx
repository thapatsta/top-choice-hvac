"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Phone, RotateCcw } from "lucide-react";
import { PhoneLink, PhoneText } from "@/components/Phone";
import { buttonClasses } from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import { formatCAD } from "@/lib/format";
import {
  TON_OPTIONS,
  getFinderResult,
  heatPumpRate,
  heatPumpRebate,
  type FinderAnswers,
  type HeatSource,
  type HomeType,
  type IncomeAnswer,
  type LineKind,
  type Project,
  type Tons,
} from "@/data/rebates";

type StepKey = "heat" | "project" | "home" | "income";

interface Step {
  key: StepKey;
  question: string;
  hint: string;
  options: { value: string; label: string; sub?: string }[];
}

const STEPS: Step[] = [
  {
    key: "heat",
    question: "What heats your home today?",
    hint: "The amount depends on this. Most GTA homes use natural gas.",
    options: [
      { value: "gas", label: "Natural gas", sub: "Enbridge customer" },
      { value: "electric", label: "Electric", sub: "Baseboards or electric furnace" },
      { value: "oil", label: "Oil" },
      { value: "propane-wood", label: "Propane or wood" },
      { value: "not-sure", label: "Not sure" },
    ],
  },
  {
    key: "project",
    question: "What are you looking at?",
    hint: "No wrong answer. Rebates in Ontario follow heat pumps.",
    options: [
      { value: "furnace", label: "Replacing my furnace" },
      { value: "ac", label: "Replacing my AC" },
      { value: "heat-pump", label: "A heat pump" },
      { value: "not-sure", label: "Not sure yet" },
    ],
  },
  {
    key: "home",
    question: "Which describes your home?",
    hint: "The rebate goes to the property owner.",
    options: [
      { value: "house", label: "I own a house, semi or townhome" },
      { value: "condo", label: "Condo or apartment" },
      { value: "rent", label: "I rent. My landlord owns it." },
    ],
  },
  {
    key: "income",
    question: "Is your household income on the lower side?",
    hint: "Or do you get income-based benefits? Free programs exist for some households.",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "unsure", label: "Not sure" },
    ],
  },
];

const KIND_STYLES: Record<LineKind, { label: string; pill: string }> = {
  open: { label: "Open now", pill: "bg-success/15 text-success" },
  announced: { label: "Announced", pill: "bg-ember-light text-ember-dark" },
  info: { label: "Good to know", pill: "bg-navy/10 text-navy" },
};

export function RebateFinder() {
  const [answers, setAnswers] = useState<Partial<Record<StepKey, string>>>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [tons, setTons] = useState<Tons>(3);
  const resultRef = useRef<HTMLHeadingElement>(null);

  const done = stepIndex >= STEPS.length;
  const step = STEPS[Math.min(stepIndex, STEPS.length - 1)];

  function choose(key: StepKey, value: string) {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    track("rebate_finder", { action: "answer", step: key, choice: value });
    const nextIndex = stepIndex + 1;
    setStepIndex(nextIndex);
    if (nextIndex >= STEPS.length) {
      const result = getFinderResult(toAnswers(next));
      track("rebate_finder", { action: "result", verdict: result.verdict });
      // Move focus to the result so keyboard and screen reader users land on it.
      requestAnimationFrame(() => resultRef.current?.focus());
    }
  }

  function back() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function restart() {
    track("rebate_finder", { action: "restart" });
    setAnswers({});
    setStepIndex(0);
    setTons(3);
  }

  return (
    <div
      data-track-location="rebate_finder"
      className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-navy/10"
    >
      <div className="flex items-center justify-between gap-4 bg-navy px-5 py-4 text-white sm:px-8">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-ember-light">
            Rebate finder
          </p>
          <p className="text-sm text-white/70">Four taps. No email needed.</p>
        </div>
        <ol className="flex items-center gap-2" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li
              key={s.key}
              aria-current={i === stepIndex && !done ? "step" : undefined}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i < stepIndex || done
                  ? "w-6 bg-ember"
                  : i === stepIndex
                    ? "w-6 bg-white"
                    : "w-2.5 bg-white/30"
              }`}
            >
              <span className="sr-only">
                Step {i + 1} of {STEPS.length}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="p-5 sm:p-8" aria-live="polite">
        {!done ? (
          <div key={step.key} className="rebate-rise">
            <h2 className="font-display text-2xl font-bold text-navy sm:text-3xl">
              {step.question}
            </h2>
            <p className="mt-2 text-muted">{step.hint}</p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {step.options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={answers[step.key] === opt.value}
                  onClick={() => choose(step.key, opt.value)}
                  className={`flex min-h-[64px] flex-col justify-center rounded-xl border-2 px-4 py-3 text-left transition-colors ${
                    answers[step.key] === opt.value
                      ? "border-ember bg-ember-light"
                      : "border-border bg-card hover:border-ember/60 hover:bg-cream"
                  }`}
                >
                  <span className="font-display text-lg font-bold text-navy">{opt.label}</span>
                  {opt.sub && <span className="text-sm text-muted">{opt.sub}</span>}
                </button>
              ))}
            </div>
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={back}
                className="mt-5 inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-muted hover:text-navy"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Back
              </button>
            )}
          </div>
        ) : (
          <Result
            answers={toAnswers(answers)}
            tons={tons}
            onTons={setTons}
            onRestart={restart}
            headingRef={resultRef}
          />
        )}
      </div>
    </div>
  );
}

function toAnswers(a: Partial<Record<StepKey, string>>): FinderAnswers {
  return {
    heat: (a.heat ?? "not-sure") as HeatSource,
    project: (a.project ?? "not-sure") as Project,
    home: (a.home ?? "house") as HomeType,
    income: (a.income ?? "no") as IncomeAnswer,
  };
}

function Result({
  answers,
  tons,
  onTons,
  onRestart,
  headingRef,
}: {
  answers: FinderAnswers;
  tons: Tons;
  onTons: (t: Tons) => void;
  onRestart: () => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const result = getFinderResult(answers);
  const rate = heatPumpRate(answers.heat);
  const amount = heatPumpRebate(answers.heat, tons);
  const capped = tons * rate.perTon > rate.cap;
  const stamp =
    result.verdict === "stack"
      ? { text: "Likely eligible", tone: "border-success text-success" }
      : result.verdict === "no-rebate-for-project"
        ? { text: "Heat pump route", tone: "border-ember text-ember" }
        : { text: "Check with us", tone: "border-navy text-navy" };

  return (
    <div className="rebate-rise">
      <div className="relative">
        <span
          className={`rebate-stamp absolute right-0 top-0 hidden rotate-[-6deg] rounded-md border-[3px] px-3 py-1 font-display text-sm font-extrabold uppercase tracking-widest sm:block ${stamp.tone}`}
        >
          {stamp.text}
        </span>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-2xl font-bold text-navy outline-none sm:max-w-[75%] sm:text-3xl"
        >
          {result.headline}
        </h2>
        <p className="mt-3 max-w-2xl text-muted">{result.lead}</p>
      </div>

      {result.showCalculator && (
        <div className="mt-6 rounded-2xl bg-navy p-5 text-white sm:p-6">
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-ember-light">
            {result.verdict === "no-rebate-for-project"
              ? "If you switch to a heat pump instead"
              : "Ontario rebate on today’s rules"}
          </p>
          <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-1">
            <span className="font-display text-5xl font-extrabold leading-none sm:text-6xl">
              {formatCAD(amount)}
            </span>
            <span className="pb-1 text-white/70">
              {tons} tons × {formatCAD(rate.perTon)}
              {capped ? `, capped at ${formatCAD(rate.cap)}` : ""}
            </span>
          </div>
          <fieldset className="mt-5">
            <legend className="text-sm text-white/70">
              System size. Most homes land between 2 and 4 tons, and your assessment sets the real
              number.
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {TON_OPTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={tons === t}
                  onClick={() => onTons(t)}
                  className={`min-h-[44px] min-w-[64px] rounded-lg border-2 px-4 font-display font-bold transition-colors ${
                    tons === t
                      ? "border-ember bg-ember text-white"
                      : "border-white/30 text-white hover:border-white"
                  }`}
                >
                  {t} ton
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {result.lines.length > 0 && (
        <ul className="mt-6 divide-y divide-dashed divide-border rounded-2xl border border-border">
          {result.lines.map((line) => {
            const style = KIND_STYLES[line.kind];
            return (
              <li key={line.label} className="grid gap-1 p-4 sm:grid-cols-[1fr_auto] sm:gap-x-6 sm:p-5">
                <div>
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${style.pill}`}
                  >
                    {style.label}
                  </span>
                  <p className="mt-1.5 font-display text-lg font-bold text-navy">{line.label}</p>
                  <p className="mt-1 text-sm text-muted">{line.detail}</p>
                </div>
                <p className="font-display text-lg font-extrabold text-navy sm:text-right">
                  {line.amount}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <div
        data-track-location="rebate_finder_result"
        className="mt-6 rounded-2xl border-2 border-dashed border-ember bg-ember-light/50 p-5 sm:p-6"
      >
        <p className="font-display text-xl font-bold text-navy">
          Call us before you sign or buy anything.
        </p>
        <p className="mt-1 text-navy/80">
          The rebate needs written approval before work begins. We handle that paperwork for you
          and confirm the real number at a free in-home assessment.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <PhoneLink className={buttonClasses("primary", "lg")}>
            <Phone size={20} aria-hidden="true" />
            <span>
              Call <PhoneText />
            </span>
          </PhoneLink>
          <Link
            href={`/get-quote?system=${result.quoteSystem}`}
            onClick={() => track("rebate_finder", { action: "cta_quote" })}
            className={buttonClasses("secondary", "lg")}
          >
            Get my free quote
          </Link>
        </div>
      </div>

      <button
        type="button"
        onClick={onRestart}
        className="mt-5 inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-muted hover:text-navy"
      >
        <RotateCcw size={16} aria-hidden="true" />
        Start over
      </button>
    </div>
  );
}
