// FAQs every city can use, reworded with the city name. They're marked
// cityspecific: false and are left out of the duplicate-content check. Each
// answer leads with the direct answer and runs 40-90 words (the tests check).
// Only facts decided with Patrick: install pricing "starting from $2,199"
// for a base-tier furnace, same-day installs possible in some cases,
// 10-year labour warranty on installs, a callback usually within 15 minutes,
// open 24/7.

import type { Faq } from "./types";
import { PRICE_FROM } from "./facts";

export type SharedFaqId = "pricing" | "same-day" | "warranty" | "callback" | "no-heat" | "gas-and-co";

export function sharedFaq(id: SharedFaqId, city: string): Faq {
  switch (id) {
    case "pricing":
      return {
        q: `How much does a new furnace cost in ${city}?`,
        a: `Furnace installation in ${city} starts from ${PRICE_FROM} for a base-tier furnace. That is a starting point, not a flat price: larger and higher-efficiency models cost more. We confirm your exact price in writing at a free in-home visit, before any work begins.`,
        cityspecific: false,
      };
    case "same-day":
      return {
        q: `Can a furnace be installed the same day in ${city}?`,
        a: `Sometimes. A same-day furnace installation is possible in some cases, depending on the model, the venting and our schedule that day. If your furnace has failed in cold weather, tell us when we call back and we'll say plainly whether the same day is realistic.`,
        cityspecific: false,
      };
    case "warranty":
      return {
        q: `What warranty comes with a furnace or AC installed in ${city}?`,
        a: `Our installs come with a 10-year labour warranty. That covers our workmanship on the installation itself. The equipment carries its own manufacturer's warranty, and we stand behind our work with a satisfaction guarantee. We go over the details with you at your visit.`,
        cityspecific: false,
      };
    case "callback":
      return {
        q: `How fast will Top Choice HVAC call me back in ${city}?`,
        a: `We call you back, usually within 15 minutes. Call or send a quote request and a person gets back to you, day or night, because we're open 24/7. If it's an emergency, say so at the start so we can put you first.`,
        cityspecific: false,
      };
    case "no-heat":
      return {
        q: `What should I do if my furnace stops working in ${city} in the middle of winter?`,
        a: `Call us right away and tell us you have no heat. Check that the thermostat is set to heat and has power first, and that the furnace switch is on. We're open 24/7 and call you back, usually within 15 minutes. Keep doors to unused rooms closed so the heat you have stays put.`,
        cityspecific: false,
      };
    case "gas-and-co":
      // TODO(Robin): confirm this wording. Keep it conservative: no steps
      // beyond leaving, 911 and the gas utility.
      return {
        q: "What should I do if I smell gas or my carbon monoxide alarm goes off?",
        a: "Leave the home straight away. Once you're outside, call 911 and your gas utility's emergency line. Do not call us first. Once the gas utility or emergency services have cleared the home, we can inspect the furnace and its venting if it's suspected.",
        cityspecific: false,
      };
  }
}
