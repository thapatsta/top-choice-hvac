"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { GoogleGIcon } from "@/components/icons/GoogleGIcon";
import type { LpReview } from "@/data/reviews";

// The review carousel on the repair and install pages: a scroll-snap track
// with filter chips, prev/next, dots and a gentle auto-advance. Auto-advance
// only runs while the track is on screen, stops for 12 seconds after any
// touch, wheel, key, hover or focus, and never runs under
// prefers-reduced-motion. No dependencies.

type Filter = "all" | "install" | "repair";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All reviews" },
  { value: "install", label: "New furnace" },
  { value: "repair", label: "Repairs and tune-ups" },
];

const AVATAR_COLOURS = ["#c2410c", "#1d4ed8", "#0369a1", "#047857", "#0f766e", "#7e22ce", "#a16207", "#b91c1c", "#4338ca"];
const ADVANCE_MS = 5500;
const HOLD_MS = 12_000;

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export function LpReviewsCarousel({
  reviews,
  googleUrl,
  googleLinkLabel,
}: {
  reviews: LpReview[];
  googleUrl: string;
  googleLinkLabel: string;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const heldUntil = useRef(0);
  const hovering = useRef(false);
  const inView = useRef(false);

  const visible = reviews
    .map((review, index) => ({ review, colour: AVATAR_COLOURS[index % AVATAR_COLOURS.length] }))
    .filter(({ review }) => filter === "all" || review.tags.includes(filter));
  const count = visible.length;

  const hold = useCallback(() => {
    heldUntil.current = Date.now() + HOLD_MS;
  }, []);

  const cards = useCallback(
    () => Array.from(trackRef.current?.querySelectorAll<HTMLElement>("[data-review]") ?? []),
    []
  );

  /** Index of the card nearest the track's left edge. */
  const current = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    const list = cards();
    const base = list[0]?.offsetLeft ?? 0;
    let nearest = 0;
    let nearestDistance = Infinity;
    list.forEach((card, i) => {
      const distance = Math.abs(card.offsetLeft - base - track.scrollLeft);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = i;
      }
    });
    return nearest;
  }, [cards]);

  const go = useCallback(
    (index: number) => {
      const track = trackRef.current;
      const list = cards();
      if (!track || !list.length) return;
      const target = list[(index + list.length) % list.length];
      track.scrollTo({
        left: target.offsetLeft - list[0].offsetLeft,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    },
    [cards]
  );

  // Active card follows the scroll position (swipes included).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setActive(current()));
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [current]);

  // Auto-advance: only on screen, never under reduced motion.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || prefersReducedMotion()) return;
    let observer: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(([entry]) => (inView.current = entry.isIntersecting), {
        threshold: 0.4,
      });
      observer.observe(track);
    } else {
      inView.current = true;
    }
    const timer = window.setInterval(() => {
      if (inView.current && !hovering.current && Date.now() > heldUntil.current) go(current() + 1);
    }, ADVANCE_MS);
    return () => {
      observer?.disconnect();
      window.clearInterval(timer);
    };
  }, [current, go]);

  function choose(next: Filter) {
    hold();
    setFilter(next);
    setActive(0);
    trackRef.current?.scrollTo({ left: 0 });
  }

  return (
    <div
      data-track-location="lp_reviews"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") hovering.current = true;
      }}
      onPointerLeave={() => {
        if (hovering.current) hold();
        hovering.current = false;
      }}
      onFocus={hold}
    >
      <div className="mb-[18px] mt-3.5 flex flex-wrap gap-2" role="group" aria-label="Filter reviews">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={filter === f.value}
            onClick={() => choose(f.value)}
            className={`min-h-[44px] cursor-pointer rounded-full border-[1.5px] px-4 py-[9px] text-[16px] font-semibold ${
              filter === f.value ? "border-lp-ink bg-lp-ink text-lp-bg" : "border-lp-fline bg-transparent text-lp-ink"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div
        ref={trackRef}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Customer reviews. Use the arrow keys to move between reviews."
        onPointerDown={hold}
        onTouchStart={hold}
        onWheel={hold}
        onKeyDown={(e) => {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
          e.preventDefault();
          hold();
          go(current() + (e.key === "ArrowRight" ? 1 : -1));
        }}
        className="lpt-track relative flex snap-x snap-mandatory gap-4 overflow-x-auto px-0.5 pb-2.5 pt-1"
      >
        {visible.map(({ review, colour }, i) => (
          <article
            key={review.firstName}
            data-review=""
            data-active={i === active ? "true" : "false"}
            role="group"
            aria-roledescription="slide"
            aria-label={`Review ${i + 1} of ${count}, from ${review.firstName}`}
            className={`flex-[0_0_min(86%,380px)] snap-start rounded-[10px] border border-lp-line bg-lp-panel p-[18px] transition-[box-shadow,transform] duration-200 motion-reduce:transition-none ${
              i === active ? "-translate-y-0.5 shadow-[0_8px_24px_rgba(0,0,0,0.10)]" : ""
            }`}
          >
            <div className="mb-2 flex items-center gap-3">
              <span
                aria-hidden="true"
                className="grid h-10 w-10 flex-none place-items-center rounded-full text-[18px] font-bold text-white"
                style={{ background: colour }}
              >
                {review.firstName[0]}
              </span>
              <div>
                <b className="block leading-tight">{review.firstName}</b>
                <span className="inline-flex gap-px" role="img" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: review.rating }).map((_, s) => (
                    <Star
                      key={s}
                      size={16}
                      className="lpt-star fill-lp-star text-lp-star"
                      style={{ "--i": s } as React.CSSProperties}
                      aria-hidden="true"
                    />
                  ))}
                </span>
              </div>
              <span className="ml-auto">
                <GoogleGIcon size={18} />
              </span>
            </div>
            <p className="text-[17px]">{review.text}</p>
          </article>
        ))}
      </div>

      <div className="mb-1.5 mt-2 flex items-center justify-center gap-3.5">
        <button
          type="button"
          aria-label="Previous review"
          onClick={() => {
            hold();
            go(current() - 1);
          }}
          className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border-[1.5px] border-lp-fline text-lp-ink hover:bg-lp-ink hover:text-lp-bg"
        >
          <ChevronLeft size={24} aria-hidden="true" />
        </button>
        <div className="flex flex-wrap items-center justify-center gap-0.5">
          {visible.map(({ review }, i) => (
            <button
              key={review.firstName}
              type="button"
              aria-label={`Show review ${i + 1} of ${count}`}
              aria-current={i === active ? "true" : undefined}
              onClick={() => {
                hold();
                go(i);
              }}
              className="grid h-11 min-w-6 cursor-pointer place-items-center"
            >
              <span
                className={`block h-2.5 rounded-full transition-[width] duration-200 motion-reduce:transition-none ${
                  i === active ? "w-6 bg-lp-cta" : "w-2.5 bg-lp-fline"
                }`}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label="Next review"
          onClick={() => {
            hold();
            go(current() + 1);
          }}
          className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border-[1.5px] border-lp-fline text-lp-ink hover:bg-lp-ink hover:text-lp-bg"
        >
          <ChevronRight size={24} aria-hidden="true" />
        </button>
      </div>

      <p className="mt-3">
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center font-bold text-lp-cta-dark underline-offset-4 hover:underline"
        >
          {googleLinkLabel}
        </a>
      </p>
    </div>
  );
}
