/**
 * Timeline artwork: a pre-approval form with an APPROVED stamp, an arrow,
 * then the installed unit. Says "approval first, install second" without
 * words. Decorative only.
 */
export function ApprovalArt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 190"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* form */}
      <rect x="14" y="12" width="132" height="166" rx="10" className="fill-white stroke-border" strokeWidth="3" />
      <rect x="14" y="12" width="132" height="30" rx="10" className="fill-navy" />
      <rect x="14" y="30" width="132" height="12" className="fill-navy" />
      <text x="28" y="33" className="fill-white font-display" fontSize="12" fontWeight="800" letterSpacing="1.5">PRE-APPROVAL</text>
      <g className="stroke-border" strokeWidth="5" strokeLinecap="round">
        <path d="M30 62h92M30 80h70M30 98h84" />
      </g>
      <g transform="rotate(-12 82 138)">
        <rect x="32" y="120" width="100" height="36" rx="6" className="fill-success/10 stroke-success" strokeWidth="3.5" />
        <text x="82" y="144" textAnchor="middle" className="fill-success font-display" fontSize="16" fontWeight="900" letterSpacing="2">APPROVED</text>
      </g>

      {/* arrow */}
      <g className="stroke-ember" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M160 96h42" strokeDasharray="2 9" />
        <path d="M196 84l14 12-14 12" />
      </g>
      <text x="184" y="124" textAnchor="middle" className="fill-ember-dark font-display" fontSize="11" fontWeight="800" letterSpacing="1">THEN</text>

      {/* installed unit + house corner */}
      <rect x="222" y="62" width="124" height="100" rx="6" className="fill-cream stroke-border" strokeWidth="3" />
      <path d="M214 66 284 18 354 66Z" className="fill-ember" />
      <rect x="240" y="108" width="88" height="54" rx="9" className="fill-white stroke-navy-light" strokeWidth="3" />
      <circle cx="284" cy="135" r="21" className="fill-cream stroke-navy" strokeWidth="3" />
      <g className="rebate-fan">
        {[0, 90, 180, 270].map((deg) => (
          <path
            key={deg}
            d="M284 135 C284 120, 296 117, 301 124 C294 128, 288 131, 284 135Z"
            transform={`rotate(${deg} 284 135)`}
            className="fill-ember"
          />
        ))}
      </g>
      <circle cx="284" cy="135" r="3.5" className="fill-navy" />
      <circle cx="334" cy="34" r="16" className="fill-success" />
      <path d="M326 34l6 6 11-12" className="stroke-white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
