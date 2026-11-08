import { formatCAD } from "@/lib/format";
import { heatPumpBarShare, heatPumpRate, heatPumpRebate, type HeatSource } from "@/data/rebates";

const ROWS: { heat: HeatSource; label: string; bar: string }[] = [
  { heat: "gas", label: "Enbridge natural gas home", bar: "bg-ember" },
  { heat: "electric", label: "Electric, oil, propane or wood", bar: "bg-navy" },
];

/**
 * The heat pump rebate by how you heat, drawn to scale. The numbers come from
 * data/rebates.ts, so the chart can't drift from the finder. The bars are
 * decorative; the same figures are in the text next to each one.
 */
export function RebateBars() {
  return (
    <figure className="rounded-2xl border border-border bg-cream p-4 sm:p-5">
      <figcaption className="font-display text-xs font-bold uppercase tracking-[0.18em] text-muted">
        Heat pump rebate, by how you heat
      </figcaption>
      <div className="mt-4 flex flex-col gap-5">
        {ROWS.map(({ heat, label, bar }) => {
          const rate = heatPumpRate(heat);
          return (
            <div key={heat}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold text-navy">{label}</p>
                <p className="font-display text-xl font-extrabold text-navy">
                  Up to {formatCAD(rate.cap)}
                </p>
              </div>
              <div
                aria-hidden="true"
                className="mt-2 h-4 w-full overflow-hidden rounded-full bg-border/70"
              >
                <div
                  className={`rebate-bar h-full rounded-full ${bar}`}
                  style={{ width: `${Math.round(heatPumpBarShare(heat) * 100)}%` }}
                />
              </div>
              <p className="mt-1.5 text-sm text-muted">
                {formatCAD(rate.perTon)} per ton. A 3-ton system gets{" "}
                <span className="font-semibold text-navy">{formatCAD(heatPumpRebate(heat, 3))}</span>.
              </p>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-muted">
        Your assessment sets the real system size. Amounts are the program&rsquo;s per-ton formula,
        up to its cap.
      </p>
    </figure>
  );
}
