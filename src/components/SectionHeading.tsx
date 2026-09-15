import React from 'react';

interface SectionHeadingProps {
  /** Small uppercase label above the title, for context. */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Right-aligned control, e.g. a filter toggle. */
  action?: React.ReactNode;
  /** Heading level, so pages keep a correct document outline. */
  as?: 'h1' | 'h2';
  id?: string;
}

/**
 * One section header used across every listing surface, so the vertical rhythm
 * and type hierarchy stay identical between Home, Recommendations and details.
 */
const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  description,
  action,
  as: Tag = 'h2',
  id,
}) => (
  <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
    <div className="min-w-0">
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <Tag id={id} className="text-section text-balance text-ink">
        {title}
      </Tag>
      {description && (
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink-muted">{description}</p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export default SectionHeading;
