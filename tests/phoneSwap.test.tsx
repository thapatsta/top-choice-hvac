// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let pathname = "/lp/furnace-repair";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

import { PhoneLink, PhoneText, TextWithPhone } from "@/components/Phone";
import { markLeadSent, resetLeadSentFallback } from "@/lib/callIntent";
import { PHONE } from "@/lib/phone";
import { FORWARDING_EVENT, normalizeForwardingNumber, PHONE_CONVERSION_CALLBACK_JS } from "@/lib/phoneSwap";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

function render(ui: React.ReactNode) {
  act(() => root.render(ui));
}

function googleAssignsForwardingNumber() {
  const callback = new Function(`return (${PHONE_CONVERSION_CALLBACK_JS})`)() as (f: string, p: string) => void;
  act(() => callback("(647) 555-0199", "6475550199"));
}

const ui = (
  <>
    <PhoneLink>
      Call <PhoneText />
    </PhoneLink>
    <PhoneLink swap={false}>
      <PhoneText swap={false} />
    </PhoneLink>
  </>
);

beforeEach(() => {
  pathname = "/lp/furnace-repair";
  sessionStorage.clear();
  resetLeadSentFallback();
  delete window.__tchForwardingNumber;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const links = () => [...container.querySelectorAll("a")];

describe("<PhoneLink> / <PhoneText> number swap", () => {
  it("renders the real number, marked, before any swap", () => {
    render(ui);
    expect(links().map((a) => a.getAttribute("href"))).toEqual([PHONE.href, PHONE.href]);
    expect(links().every((a) => a.hasAttribute("data-call-link"))).toBe(true);
    expect(container.querySelector(".js-swap-phone")?.textContent).toBe(PHONE.display);
  });

  it("an Ads visitor sees the forwarding number in swappable elements only", () => {
    render(ui);
    googleAssignsForwardingNumber();
    const [swappable, nap] = links();
    expect(swappable.getAttribute("href")).toBe("tel:+16475550199");
    expect(swappable.textContent).toBe("Call (647) 555-0199");
    expect(swappable.getAttribute("data-swapped")).toBe("true");
    expect(nap.getAttribute("href")).toBe(PHONE.href);
    expect(nap.textContent).toBe(PHONE.display);
  });

  it("never swaps on /thank-you (a call there would double count the lead)", () => {
    pathname = "/thank-you";
    render(ui);
    googleAssignsForwardingNumber();
    expect(links()[0].getAttribute("href")).toBe(PHONE.href);
  });

  it("switches back to the real number as soon as a lead is sent from this tab", () => {
    render(ui);
    googleAssignsForwardingNumber();
    expect(links()[0].getAttribute("href")).toBe("tel:+16475550199");
    act(() => markLeadSent());
    expect(links()[0].getAttribute("href")).toBe(PHONE.href);
    expect(links()[0].hasAttribute("data-swapped")).toBe(false);
  });

  it("TextWithPhone swaps only the number inside copy", () => {
    render(<TextWithPhone text={`Prefer to talk now? Call ${PHONE.display}.`} />);
    googleAssignsForwardingNumber();
    expect(container.textContent).toBe("Prefer to talk now? Call (647) 555-0199.");
  });

  it("ignores junk from the callback (never renders arbitrary text)", () => {
    render(ui);
    act(() => {
      window.__tchForwardingNumber = { formatted: "<img src=x>", plain: "call me" };
      window.dispatchEvent(new Event(FORWARDING_EVENT));
    });
    expect(links()[0].getAttribute("href")).toBe(PHONE.href);
    expect(normalizeForwardingNumber("(647) 763-2970", "+16477632970")).toBeNull();
    expect(normalizeForwardingNumber("weird", "+1 647 555 0199")).toEqual({
      display: "(647) 555-0199",
      href: "tel:+16475550199",
      digits: "6475550199",
    });
  });
});
