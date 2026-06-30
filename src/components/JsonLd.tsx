// Renders a JSON-LD <script> for structured data (helps SEO, rich results, and
// AI/answer engines understand the page). Server component.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
