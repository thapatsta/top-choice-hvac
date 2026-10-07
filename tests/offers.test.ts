import { describe, expect, it } from "vitest";
import { furnaceInstallOffer } from "@/data/offers";
import { promotions } from "@/data/promotions";
import { getServiceBySlug, services } from "@/data/services";
import { getEstimateFraming, systemTypeOptions, type QuoteNeed } from "@/lib/estimate";
import { formatCAD } from "@/lib/format";

const offerPrice = formatCAD(furnaceInstallOffer.priceFrom);
const installNeeds: QuoteNeed[] = ["replacement", "new-install"];
const dollarAmounts = (text: string) => text.match(/\$[\d,]+/g) ?? [];

describe("furnace installation offer", () => {
  it("formats the starting price as Canadian dollars", () => {
    expect(offerPrice).toBe("$2,199");
    expect(furnaceInstallOffer.headline).toContain(offerPrice);
  });

  it("is set on the furnace-installation service and no other", () => {
    expect(getServiceBySlug("furnace-installation")?.offer).toBe(furnaceInstallOffer);
    const withOffer = services.filter((s) => s.offer).map((s) => s.slug);
    expect(withOffer).toEqual(["furnace-installation"]);
  });

  it("answers the final-price FAQ from the offer data", () => {
    const faq = getServiceBySlug("furnace-installation")?.faqs.find(
      (f) => f.question === `Is ${offerPrice} the final price?`
    );
    expect(faq?.answer).toContain(furnaceInstallOffer.summary);
    expect(faq?.answer).toContain(furnaceInstallOffer.note);
  });

  it("is mentioned in the furnace-installation meta description", () => {
    expect(getServiceBySlug("furnace-installation")?.metaDescription).toContain(offerPrice);
  });
});

describe("getEstimateFraming", () => {
  it.each(installNeeds)("quotes only the offer's starting price for a furnace %s", (need) => {
    const text = getEstimateFraming(need, "furnace");
    expect(text).toBe(
      `Furnace installations start from ${offerPrice} for a base-tier furnace. We'll confirm your exact price after a quick, free in-home assessment.`
    );
    expect(dollarAmounts(text)).toEqual([offerPrice]);
  });

  it("keeps the furnace repair range", () => {
    expect(getEstimateFraming("repair", "furnace")).toBe(
      "Most furnace repairs like yours run between $250–$900."
    );
  });

  it("keeps the installed ranges for every other system type", () => {
    expect(getEstimateFraming("replacement", "ac")).toBe(
      "Most air conditioner replacements like yours run between $4,000–$7,500 installed — we'll confirm your exact price after a quick, free in-home assessment."
    );
    expect(getEstimateFraming("new-install", "water-heater")).toBe(
      "Most water heater installs like yours run between $1,800–$4,500 installed — we'll confirm your exact price after a quick, free in-home assessment."
    );
    for (const { value } of systemTypeOptions.filter((s) => s.value !== "furnace")) {
      for (const need of installNeeds) {
        expect(getEstimateFraming(need, value)).toMatch(/run between \$[\d,]+–\$[\d,]+ installed/);
      }
    }
  });

  it("keeps the maintenance wording", () => {
    expect(getEstimateFraming("maintenance", "furnace")).not.toMatch(/\$/);
  });
});

describe("promotions", () => {
  it("lists the furnace offer first, with its formatted price", () => {
    const [first] = promotions;
    expect(first.slug).toBe("furnace-installation-offer");
    expect(`${first.title} ${first.description}`).toContain(offerPrice);
    expect(first.validity).toBe("Ongoing");
  });
});

describe("old furnace placeholder range", () => {
  it("appears nowhere the offer is shown", () => {
    const shown = JSON.stringify([
      getServiceBySlug("furnace-installation"),
      promotions,
      installNeeds.map((need) => getEstimateFraming(need, "furnace")),
    ]);
    expect(shown).toContain(offerPrice);
    expect(shown).not.toContain("$4,500");
    expect(shown).not.toContain("$8,500");
  });
});
