/**
 * Hero artwork: a house, an outdoor heat pump with a spinning fan, and a
 * "rebate" tag. Decorative only, so it is hidden from assistive tech, and it
 * deliberately shows no dollar amount: the right number depends on the home.
 */
export function HeroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 440 320"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* sparkles: warm and cool air */}
      <g className="stroke-ember-light" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M312 48v28M298 62h28M302 52l20 20M322 52l-20 20" />
      </g>
      <path
        d="M70 78c10-12 4-22 0-30 14 6 24 20 18 34-3 8-10 12-18 12s-15-6-15-14c0-6 4-10 7-14 0 6 3 10 8 12Z"
        className="fill-ember"
      />

      {/* ground */}
      <path d="M10 272h420" className="stroke-white/25" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" />

      {/* house */}
      <path d="M26 150 138 66 250 150Z" className="fill-ember" />
      <rect x="196" y="82" width="20" height="44" rx="2" className="fill-ember-dark" />
      <rect x="42" y="148" width="192" height="124" rx="4" className="fill-cream" />
      <rect x="110" y="196" width="36" height="76" rx="3" className="fill-navy-light" />
      <circle cx="137" cy="236" r="3" className="fill-ember-light" />
      <g className="fill-ember-light stroke-navy" strokeWidth="3">
        <rect x="60" y="174" width="38" height="38" rx="3" />
        <rect x="170" y="174" width="46" height="38" rx="3" />
      </g>
      <g className="stroke-navy" strokeWidth="2">
        <path d="M79 174v38M60 193h38M193 174v38" />
      </g>

      {/* refrigerant lines */}
      <g className="stroke-ember" strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M234 246h34" />
        <path d="M234 258h34" className="stroke-ember-light" />
      </g>

      {/* outdoor heat pump */}
      <rect x="262" y="270" width="132" height="8" rx="3" className="fill-white/20" />
      <rect x="268" y="196" width="120" height="76" rx="10" className="fill-white stroke-navy-light" strokeWidth="3" />
      <circle cx="328" cy="234" r="29" className="fill-cream stroke-navy" strokeWidth="3" />
      <g className="rebate-fan">
        {[0, 90, 180, 270].map((deg) => (
          <path
            key={deg}
            d="M328 234 C328 214, 344 210, 350 220 C342 224, 334 228, 328 234Z"
            transform={`rotate(${deg} 328 234)`}
            className="fill-ember"
          />
        ))}
      </g>
      <circle cx="328" cy="234" r="4.5" className="fill-navy" />
      <g className="stroke-navy-light/40" strokeWidth="2" strokeLinecap="round">
        <path d="M278 214v40M378 214v40" />
      </g>

      {/* rebate tag */}
      <g transform="rotate(-8 330 120)">
        <path d="M262 92h120a8 8 0 0 1 8 8v52a8 8 0 0 1-8 8H262a8 8 0 0 1-8-8v-52a8 8 0 0 1 8-8Z" className="fill-ember-light stroke-ember" strokeWidth="3" strokeDasharray="7 5" />
        <circle cx="274" cy="126" r="7" className="fill-navy" />
        <circle cx="274" cy="126" r="3" className="fill-ember-light" />
        <text x="292" y="120" className="fill-ember-dark font-display" fontSize="15" fontWeight="800" letterSpacing="2">REBATE</text>
        <g className="stroke-success" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M296 142l9 9 20-20" />
        </g>
        <text x="332" y="146" className="fill-navy font-display" fontSize="12" fontWeight="700">approved</text>
      </g>
    </svg>
  );
}
