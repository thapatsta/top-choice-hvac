"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

// Client-side navigation back to "/" remounts the .instagram-media blockquote
// without re-running the already-loaded embed.js, so it never gets converted
// into the actual embed. Re-processing it on mount fixes that.
export function InstagramEmbedProcessor() {
  useEffect(() => {
    window.instgrm?.Embeds.process();
  }, []);

  return null;
}
