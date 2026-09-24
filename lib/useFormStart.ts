"use client";

import { useCallback, useRef } from "react";
import type { LeadSource } from "@/lib/leadAdapter";
import { track } from "@/lib/analytics";

/**
 * Returns a handler that fires `form_start` on its first call and ignores the
 * rest, once per form mount. Wire it to the form container's onFocus and
 * onChange so the first focused field or first selected choice counts.
 */
export function useFormStart(leadSource: LeadSource) {
  const started = useRef(false);
  return useCallback(() => {
    if (started.current) return;
    started.current = true;
    track("form_start", { lead_source: leadSource });
  }, [leadSource]);
}
