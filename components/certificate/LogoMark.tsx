/** Built-in placeholder for the brand logo: a ring around a dotted "T". */
export function LogoMark() {
  return (
    <svg className="size-[10.5cqw]" viewBox="0 0 100 100" role="img" aria-label="Logo mark">
      <circle
        className="stroke-(--cert-seal-ring)"
        cx="50"
        cy="50"
        r="45"
        fill="none"
        strokeWidth="4"
      />
      <g className="fill-(--cert-seal-mark)">
        <circle cx="33" cy="32" r="5.5" />
        <circle cx="50" cy="32" r="5.5" />
        <circle cx="67" cy="32" r="5.5" />
        <circle cx="50" cy="49" r="5.5" />
        <circle cx="50" cy="65" r="5.5" />
        <circle cx="50" cy="80" r="4.5" />
      </g>
    </svg>
  );
}
