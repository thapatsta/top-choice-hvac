"use client";

import { useSearchParams } from "next/navigation";
import { QuoteForm } from "@/components/quote/QuoteForm";
import { systemTypeOptions, type QuoteSystemType } from "@/lib/estimate";

/**
 * Reads ?system= (e.g. from the /rebates finder) and preselects that system
 * on the quote form. Only known values are accepted; anything else is ignored.
 */
export function QuoteFormWithPrefill({ source }: { source?: string }) {
  const raw = useSearchParams().get("system");
  const initialSystemType = systemTypeOptions.find((o) => o.value === raw)?.value as
    | QuoteSystemType
    | undefined;
  return <QuoteForm source={source} initialSystemType={initialSystemType} />;
}
