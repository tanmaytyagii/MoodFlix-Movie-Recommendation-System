import React from 'react';
import { AlertCircle, RefreshCw, SearchX } from 'lucide-react';

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
 * Empty and error are deliberately different components visually and
 * semantically: "no movies matched" is a normal outcome, "we could not reach the
 * API" is a failure the user can retry. The old code rendered both as the same
 * "No movies found" text.
 */
const StatusMessage: React.FC<StatusMessageProps> = ({
  variant,
  title,
  description,
  onRetry,
  retryLabel = 'Try again',
}) => {
  const isError = variant === 'error';
  const Icon = isError ? AlertCircle : SearchX;

  return (
    <div
      className="mx-auto flex max-w-md flex-col items-center gap-3 py-12 text-center"
      role={isError ? 'alert' : 'status'}
    >
      <Icon size={36} className={isError ? 'text-red-400' : 'text-gray-500'} aria-hidden="true" />
      <h3 className="text-xl font-semibold text-gray-200">{title}</h3>
      {description && <p className="text-gray-400">{description}</p>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
        >
          <RefreshCw size={16} aria-hidden="true" />
          {retryLabel}
        </button>
      )}
    </div>
  );
};

export default StatusMessage;
