// Thin wrapper over the Tabler icon webfont (loaded in layout.tsx).
export function Icon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return <i className={`ti ti-${name} ${className}`} aria-hidden="true" />;
}
