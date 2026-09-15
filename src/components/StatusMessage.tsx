import React from 'react';
import { RefreshCw, SearchX, WifiOff } from 'lucide-react';

interface StatusMessageProps {
  variant: 'error' | 'empty';
  title: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * Shared empty/error panel.
 *
 * Empty and error stay visually and semantically distinct: "nothing matched" is
 * a normal outcome, "we could not reach the API" is a failure worth retrying.
 * Copy is passed in by the caller and is never softened into a false success.
 */
const StatusMessage: React.FC<StatusMessageProps> = ({
  variant,
  title,
  description,
  onRetry,
  retryLabel = 'Try again',
}) => {
  const isError = variant === 'error';
  const Icon = isError ? WifiOff : SearchX;

  return (
    <div
      className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center sm:py-24"
      role={isError ? 'alert' : 'status'}
    >
      <span
        aria-hidden="true"
        className={[
          'mb-5 grid h-14 w-14 place-items-center rounded-full border',
          isError ? 'border-critical/25 bg-critical/10 text-critical' : 'border-line bg-surface text-ink-faint',
        ].join(' ')}
      >
        <Icon size={22} />
      </span>

      <h3 className="text-xl font-semibold tracking-tight text-ink">{title}</h3>
      {description && <p className="mt-2 text-sm leading-relaxed text-ink-muted">{description}</p>}

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="pressable mt-6 inline-flex items-center gap-2 rounded-lg border border-line-strong bg-surface-raised px-4 py-2.5 text-sm font-medium text-ink shadow-control hover:border-accent/50 hover:bg-surface-hover hover:text-accent"
        >
          <RefreshCw size={15} aria-hidden="true" />
          {retryLabel}
        </button>
      )}
    </div>
  );
};

export default StatusMessage;
