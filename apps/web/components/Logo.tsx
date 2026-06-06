interface Props {
  size?: number | string;
  className?: string;
}

/** Cluely OS brand mark — an open aperture "C" with a node. */
export default function Logo({ size = 20, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="cluely-web-grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <path
        d="M18.5 7.2A7.5 7.5 0 1 0 18.5 16.8"
        stroke="url(#cluely-web-grad)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="18.4" cy="12" r="2.5" fill="url(#cluely-web-grad)" />
    </svg>
  );
}
