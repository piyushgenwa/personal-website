/** Section shell: an eyebrow label, a hairline, and content on the page gutter. */
export function Section({
  id,
  label,
  title,
  children,
  className = '',
}: {
  id?: string;
  label: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`px-6 py-24 sm:px-10 sm:py-32 ${className}`}>
      <div className="mx-auto max-w-[1240px]">
        <div className="flex items-baseline justify-between gap-6">
          <span className="t-data">{label}</span>
          {title && <span className="t-data">{title}</span>}
        </div>
        <hr className="hairline mt-4 mb-12 sm:mb-16" />
        {children}
      </div>
    </section>
  );
}
