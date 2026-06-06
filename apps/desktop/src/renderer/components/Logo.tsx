interface Props {
  size?: number | string;
  className?: string;
}

/**
 * Cluely OS brand mark: an open aperture "C" with a node — suggests a lens that
 * watches your screen, kept deliberately open (privacy-first). Scales cleanly
 * from 14px in the bar up to large empty-state sizes.
 */
export default function Logo({ size = 16, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cluely-logo-grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      {/* open ring / aperture */}
      <path
        d="M18.5 7.2A7.5 7.5 0 1 0 18.5 16.8"
        stroke="url(#cluely-logo-grad)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* node */}
      <circle cx="18.4" cy="12" r="2.5" fill="url(#cluely-logo-grad)" />
    </svg>
  );
}
