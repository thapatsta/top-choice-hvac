/** A small spinning heat pump fan. Decorative. */
export function FanIcon({ className = "", size = 44 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <circle cx="24" cy="24" r="22" className="fill-white/10 stroke-white/40" strokeWidth="2" />
      <g className="rebate-fan">
        {[0, 90, 180, 270].map((deg) => (
          <path
            key={deg}
            d="M24 24 C24 12, 33 10, 36 16 C31 18, 27 21, 24 24Z"
            transform={`rotate(${deg} 24 24)`}
            className="fill-ember"
          />
        ))}
      </g>
      <circle cx="24" cy="24" r="3.2" className="fill-white" />
    </svg>
  );
}
