import React from 'react';

interface RatingFilterProps {
  /** Minimum TMDB score out of 10. `0` means no filter. */
  value: number;
  onChange: (value: number) => void;
}

const OPTIONS = [
  { value: 0, label: 'All' },
  { value: 6, label: '6+' },
  { value: 7, label: '7+' },
  { value: 8, label: '8+' },
];

/**
 * Minimum-rating filter.
 *
 * A segmented control rather than the previous range slider: a slider needs
 * fine pointer control, has a tiny touch target on a phone, and gives no
 * indication of which values are worth choosing. These are real radio inputs,
 * so arrow keys work and the state is announced correctly.
 */
const RatingFilter: React.FC<RatingFilterProps> = ({ value, onChange }) => (
  <fieldset className="flex items-center gap-2">
    <legend className="sr-only">Filter by minimum rating</legend>
    <span aria-hidden="true" className="eyebrow hidden sm:inline">
      Rating
    </span>

    <div className="flex rounded-xl border border-cinematic-border bg-glass-surface p-0.5 backdrop-blur-md">
      {OPTIONS.map((option) => {
        const checked = value === option.value;
        return (
          <label
            key={option.value}
            className={[
              'pressable relative cursor-pointer select-none rounded-md px-3 py-1.5 text-meta font-medium',
              'focus-within:ring-2 focus-within:ring-accent/70',
              checked
                ? 'bg-accent text-accent-contrast shadow-gold-glow'
                : 'text-ink-muted hover:bg-surface-hover hover:text-ink',
            ].join(' ')}
          >
            <input
              type="radio"
              name="minimum-rating"
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        );
      })}
    </div>
  </fieldset>
);

export default RatingFilter;
