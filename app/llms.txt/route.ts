import { buildLlmsTxt } from "@/lib/llmsTxt";

// Built at build time from site config and the ready city pages. A static
// route handler works on OpenNext/Cloudflare; app/robots.ts allows "/".
export const dynamic = "force-static";

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
