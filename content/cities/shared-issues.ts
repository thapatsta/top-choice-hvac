// The shared pool of common heating and cooling problems. Every entry is
// source "general": plain HVAC knowledge with no local claim. No city,
// neighbourhood, housing era, home type or frequency may appear here (the
// guard in tests/cityContent.test.ts fails a ready city if one does).
// Each city picks from this pool in its own order, then adds its own
// consultant / robin / patrick issues. Local issues never go in this file.

import type { Issue } from "./types";

type PoolIssue = Omit<Issue, "source" | "appliesTo"> & { source: "general" };

const pool = {
  "no-heat": {
    title: "No heat during a cold snap",
    homeownerSays: "The thermostat is calling for heat, but the vents blow cold air or nothing at all.",
    whatsUsuallyGoingOn:
      "A furnace that won't make heat is usually stopped by one of a few parts: an igniter that has cracked, a flame sensor coated in residue so it can't read the flame, a limit switch that tripped because the unit overheated, or a blower that has failed. Cold weather pushes a weak part past its limit, so a furnace that ran fine in the fall can quit on the first hard freeze.",
    whatWeDo:
      "We find which part stopped the cycle, replace it if it's the cause, and check why it failed so the same fault doesn't come back next week.",
    repairOrReplace:
      "Usually a repair. If the furnace is well into its second decade and the failed part is a major one, we talk through replacement before you spend money on it.",
    emergency: {
      is: true,
      note: "Call right away if the house is getting cold, and say so if there are young children, older adults or anyone unwell at home.",
    },
    season: "winter",
    source: "general",
  },
  "short-cycling": {
    title: "Furnace turns on and off repeatedly",
    homeownerSays: "The furnace starts, runs a few minutes, shuts off, then starts again.",
    whatsUsuallyGoingOn:
      "Short cycling usually means the furnace is overheating or losing its flame. Restricted airflow from a clogged filter or a blocked return is the common cause, and a dirty flame sensor can shut the burners off early. A furnace that is too big for the space will also cycle, because it heats the air faster than the house can use it.",
    whatWeDo:
      "We check airflow, the filter, the flame sensor and the limit switch, then clean or replace what's at fault. If the furnace is oversized, we explain what that means for repair versus replacement.",
    repairOrReplace:
      "Usually a repair. If the cause turns out to be an oversized furnace, the real fix is a different furnace, and we'd talk that through with you.",
    emergency: {
      is: false,
      note: "A dirty filter is the one thing worth checking yourself. If the furnace still cycles after a clean one, book a visit.",
    },
    season: "winter",
    source: "general",
  },
  "condensate-drain": {
    title: "Condensate drain freezing or backing up",
    homeownerSays: "The furnace shut down, and there's water near it or a gurgling sound from the drain.",
    whatsUsuallyGoingOn:
      "A high-efficiency furnace pulls so much heat out of its exhaust that the exhaust turns to water, and that water has to drain away. If the drain line freezes in cold weather, clogs, or the condensate pump fails, a safety switch shuts the furnace off so the water doesn't overflow.",
    whatWeDo:
      "We clear or replace the drain line, trap or pump, then look at why it failed, such as a poor slope or a line that runs through a cold space, and fix that part too.",
    repairOrReplace:
      "Usually a repair. Rerouting or insulating the drain line often stops it from happening again.",
    emergency: {
      is: true,
      note: "Treat it like any no-heat call if the house is cold, because the furnace stays off until the drain is fixed.",
    },
    season: "winter",
    source: "general",
  },
  "ac-not-cooling": {
    title: "AC not cooling during a heat wave",
    homeownerSays: "The AC runs, but the air from the vents is barely cool, or it won't start at all.",
    whatsUsuallyGoingOn:
      "Several things stop an AC from cooling. A dirty coil or poor airflow can make the indoor coil freeze into a block of ice. A failed capacitor keeps the compressor or fan from starting. Low refrigerant means there is a leak somewhere, because refrigerant isn't used up like fuel.",
    whatWeDo:
      "We check airflow, the capacitor and the refrigerant pressure and fix what we find. If there's a leak, we locate it and tell you what repairing it involves before anyone adds refrigerant.",
    repairOrReplace:
      "Usually a repair. A leak in an older system, or a failed compressor, is when we bring up replacement.",
    emergency: {
      is: false,
      note: "If you see ice on the indoor unit or the refrigerant lines, turn the AC off and call. Call right away in a heat wave if an older adult, a baby or someone unwell is at home.",
    },
    season: "summer",
    source: "general",
  },
  "noisy-blower": {
    title: "Noisy blower or banging ducts",
    homeownerSays: "Something rattles, squeals or bangs when the system starts up or shuts off.",
    whatsUsuallyGoingOn:
      "A squeal or grinding that follows the blower usually points to worn motor bearings or a blower wheel that has gone out of balance. Popping or banging in the ducts is often the metal flexing as air pressure changes, which can mean restricted airflow, a clogged filter, closed registers or ducts that are too small for the system.",
    whatWeDo:
      "We trace the sound to its source, service or replace the blower motor or wheel when that's the cause, and check the duct pressure when the noise is in the ducts.",
    repairOrReplace:
      "Often a repair. A failed blower motor on an old furnace can push the conversation toward replacement, since it is one of the costlier parts.",
    emergency: {
      is: false,
      note: "Switch the system off and call if you hear grinding or smell something burning.",
    },
    season: "year-round",
    source: "general",
  },
  "uneven-temperatures": {
    title: "Uneven temperatures between floors",
    homeownerSays: "The upstairs is hot and the main floor is cold, or one room never feels right.",
    whatsUsuallyGoingOn:
      "Warm air rises, and a duct system balanced for one season rarely suits the other. Undersized or crushed ducts, closed or blocked registers, a return that can't pull enough air and dampers set for summer or winter all produce hot and cold spots. Sometimes the equipment is the right size and the airflow is the only problem.",
    whatWeDo:
      "We measure airflow, check the registers and dampers, and look at the return path. Fixes range from rebalancing to adding a return or, in some systems, zoning.",
    repairOrReplace:
      "Usually an airflow fix, not a new furnace or AC. Replacement only comes up if the equipment is also undersized or at the end of its life.",
    emergency: { is: false },
    season: "year-round",
    source: "general",
  },
  thermostat: {
    title: "Thermostat problems",
    homeownerSays: "The screen is blank, or the thermostat says one thing and the house does another.",
    whatsUsuallyGoingOn:
      "Batteries and loose or broken wiring are the first suspects. Smart thermostats also need the right wiring, usually a common wire, and not every system has one. A thermostat that isn't compatible with the furnace or AC can cause a no-heat or no-cool call that has nothing to do with the equipment itself.",
    whatWeDo:
      "We test the thermostat and its wiring, confirm it works with your system, and either fix the wiring or set up a thermostat that does.",
    repairOrReplace: "A repair or a thermostat swap. It doesn't mean the furnace or AC needs replacing.",
    emergency: {
      is: false,
      note: "Check the batteries first. If there's no heat and fresh batteries don't help, call.",
    },
    season: "year-round",
    source: "general",
  },
  "r22-ac": {
    title: "Older AC that uses R-22 refrigerant",
    homeownerSays: "The AC is low on refrigerant, and I was told a refill would be expensive.",
    whatsUsuallyGoingOn:
      "R-22 was the standard refrigerant in air conditioners for decades and has since been phased out, so it is no longer produced and what's left is costly. A system that uses R-22 and has a leak is a poor place to put money, because the repair sits next to a coil and compressor that are already old.",
    whatWeDo:
      "We confirm which refrigerant the unit uses, find out whether it's leaking, and give you the repair price next to the replacement price so you can compare.",
    repairOrReplace: "Replacement is the usual conversation once an R-22 system has lost its charge.",
    emergency: { is: false },
    season: "summer",
    source: "general",
  },
  "end-of-life": {
    title: "Furnace nearing the end of its life",
    homeownerSays: "The furnace keeps needing repairs, and I'm wondering if it's time to replace it.",
    whatsUsuallyGoingOn:
      "Repair stops making sense when a furnace is around fifteen years old or more, needs repairs back to back, has a cracked heat exchanger, or has a repair quote that is a big share of a new unit's price. A cracked heat exchanger isn't a repair we'd recommend. It's a reason to replace.",
    whatWeDo:
      "We look at the furnace's age, condition and repair history, tell you honestly whether to repair or replace, and quote the replacement in writing. Furnace installation starts from $2,199 for a base-tier furnace. The price goes up with size and efficiency, so we confirm yours at the visit.",
    repairOrReplace:
      "This is the replacement conversation. If it's a one-part repair on a furnace that has otherwise been reliable, we'll say so.",
    emergency: {
      is: false,
      note: "Plan it before the furnace fails if you can. An unplanned failure in a cold snap leaves less time to compare options.",
    },
    season: "winter",
    source: "general",
  },
  safety: {
    title: "Gas smell or carbon monoxide alarm",
    homeownerSays: "I smell gas, or my carbon monoxide alarm is going off.",
    whatsUsuallyGoingOn:
      "This is a safety situation first and a service call second. A furnace, water heater or other fuel-burning appliance can be the source, but the cause can't be sorted out while you're still inside. Leave the home and call 911 and your gas utility's emergency line from outside.",
    whatWeDo:
      "We don't ask you to call us first. Once the gas utility or emergency services have cleared the home, we can inspect the furnace and its venting if it's suspected.",
    repairOrReplace: "Decided after the inspection, once the home has been cleared.",
    emergency: {
      is: true,
      note: "Leave the home and call 911 and your gas utility's emergency line. Do not call us first.",
    },
    season: "year-round",
    source: "general",
  },
} satisfies Record<string, PoolIssue>;
// TODO(Robin): confirm the "safety" wording, and the same wording in each
// city's gas smell / carbon monoxide FAQ. Nothing beyond "leave, call 911 and
// the gas utility, don't call us first" is stated.

export type SharedIssueId = keyof typeof pool;

export const SHARED_ISSUES: Record<SharedIssueId, Issue> = pool;

/** A city's pool picks, in the order given. */
export function pickShared(...ids: SharedIssueId[]): Issue[] {
  return ids.map((id) => SHARED_ISSUES[id]);
}
