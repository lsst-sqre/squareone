type TokenDateProps = {
  /** Human-readable display text */
  display: string;
  /** ISO 8601 datetime string for machine readability, or null if not applicable */
  datetime: string | null;
  /** Optional CSS class name */
  className?: string;
};

/**
 * Renders a date/time with semantic HTML.
 * Uses <time> element with datetime attribute for machine-readable dates.
 */
export default function TokenDate({
  display,
  datetime,
  className,
}: TokenDateProps) {
  if (datetime === null) {
    return <span className={className}>{display}</span>;
  }

  return (
    <time dateTime={datetime} className={className}>
      {display}
    </time>
  );
}
