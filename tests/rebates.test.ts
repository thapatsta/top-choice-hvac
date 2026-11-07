import { describe, expect, it } from "vitest";
import {
  getFinderResult,
  heatPumpRate,
  heatPumpRebate,
  programsByStatus,
  rebateFaqs,
  rebatesHandledLabel,
  REBATES_HANDLED,
  rebatePrograms,
  REBATES_VERIFIED,
  type FinderAnswers,
} from "@/data/rebates";

const base: FinderAnswers = { heat: "gas", project: "heat-pump", home: "house", income: "no" };

describe("heat pump rebate math", () => {
  it("pays $500/ton, capped at $2,000, in Enbridge gas homes", () => {
    expect(heatPumpRebate("gas", 2)).toBe(1000);
    expect(heatPumpRebate("gas", 3)).toBe(1500);
    expect(heatPumpRebate("gas", 4)).toBe(2000);
    expect(heatPumpRebate("gas", 5)).toBe(2000);
  });

  it("pays $1,250/ton, capped at $7,500, for electricity, oil, propane and wood", () => {
    for (const heat of ["electric", "oil", "propane-wood"] as const) {
      expect(heatPumpRebate(heat, 3)).toBe(3750);
      expect(heatPumpRebate(heat, 5)).toBe(6250);
      expect(heatPumpRebate(heat, 8)).toBe(7500);
    }
  });

  it("treats an unsure heating fuel as gas, the lower figure", () => {
    expect(heatPumpRate("not-sure")).toEqual(heatPumpRate("gas"));
  });
});

describe("finder results", () => {
  it("heat pump in an owned gas house is a stack with the calculator", () => {
    const r = getFinderResult(base);
    expect(r.verdict).toBe("stack");
    expect(r.showCalculator).toBe(true);
    expect(r.quoteSystem).toBe("heat-pump");
  });

  it("never counts the unannounced federal rebate as open money", () => {
    const r = getFinderResult(base);
    const federal = r.lines.find((l) => /National Heat Pump/.test(l.label));
    expect(federal?.kind).toBe("announced");
  });

  it("a like-for-like furnace swap says no rebate was found, and points to heat pumps", () => {
    const r = getFinderResult({ ...base, project: "furnace" });
    expect(r.verdict).toBe("no-rebate-for-project");
    expect(r.lines[0].amount).toBe("No rebate found");
    expect(r.quoteSystem).toBe("furnace");
    expect(r.lines.some((l) => /heat pump/i.test(l.label) && l.kind === "open")).toBe(true);
  });

  it("condos and apartments are not told they qualify", () => {
    const r = getFinderResult({ ...base, home: "condo" });
    expect(r.verdict).toBe("home-not-eligible");
    expect(r.showCalculator).toBe(false);
  });

  it("tells renters the landlord has to apply", () => {
    const r = getFinderResult({ ...base, home: "rent" });
    expect(r.lines[0].detail).toMatch(/landlord/i);
  });

  it("only offers the income-qualified line when the household might qualify", () => {
    const no = getFinderResult({ ...base, income: "no" });
    const yes = getFinderResult({ ...base, income: "yes", heat: "electric" });
    expect(no.lines.some((l) => /Affordability/.test(l.label))).toBe(false);
    expect(yes.lines.some((l) => /Affordability/.test(l.label))).toBe(true);
  });
});

describe("program data", () => {
  it("has a verification date and a source on every program", () => {
    expect(REBATES_VERIFIED).toMatch(/\d{4}/);
    for (const p of rebatePrograms) {
      expect(p.sourceUrl).toMatch(/^https:\/\//);
      expect(p.summary.length).toBeGreaterThan(10);
    }
  });

  it("closed programs have no application steps", () => {
    for (const p of programsByStatus("closed")) expect(p.howToGet).toEqual([]);
  });

  it("every program id is unique", () => {
    const ids = rebatePrograms.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has FAQ answers for every question", () => {
    for (const f of rebateFaqs) {
      expect(f.question.endsWith("?")).toBe(true);
      expect(f.answer.length).toBeGreaterThan(20);
    }
  });
});

describe("rebates handled proof", () => {
  it("shows a real count and hides anything that isn't one", () => {
    expect(rebatesHandledLabel(108)).toBe("108 rebates handled");
    expect(rebatesHandledLabel(null)).toBeNull();
    expect(rebatesHandledLabel(0)).toBeNull();
    expect(rebatesHandledLabel(-5)).toBeNull();
    expect(rebatesHandledLabel(12.5)).toBeNull();
  });

  it("uses the owner's confirmed figure", () => {
    expect(REBATES_HANDLED).toBe(108);
  });
});
