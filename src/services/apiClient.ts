import axios, { AxiosError, AxiosInstance } from 'axios';

/**
 * Shared HTTP client for MoodFlix's own `/api` routes.
 *
 * Every service failure is normalised into an `ApiError` carrying a `kind` the
 * UI can branch on. This is what lets the app distinguish "no results" from
 * "the API is down" — previously both surfaced as an empty array.
 */

export type ApiErrorKind =
  | 'network' // request never reached the server
  | 'timeout' // server did not respond in time
  | 'not_found' // upstream resource genuinely does not exist
  | 'rate_limited' // too many requests
  | 'not_configured' // server is missing a required credential
  | 'invalid_request' // we sent something the server rejected
  | 'server'; // anything else the server reported

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }

  /** Copy safe to show a user — never contains URLs, headers or stack detail. */
  get userMessage(): string {
    switch (this.kind) {
      case 'network':
        return 'Could not reach MoodFlix. Check your connection and try again.';
      case 'timeout':
        return 'That took too long to load. Please try again.';
      case 'not_found':
        return "We couldn't find what you were looking for.";
      case 'rate_limited':
        return 'Too many requests right now. Give it a moment and try again.';
      case 'not_configured':
        return 'Movie data is unavailable right now. Please try again later.';
      case 'invalid_request':
        return 'That request was not valid. Please try again.';
      default:
        return 'Something went wrong loading movies. Please try again.';
    }
  }
}

/** The error envelope our serverless handlers return. */
interface ApiErrorBody {
  error?: { code?: string; message?: string };
}

const KIND_BY_CODE: Record<string, ApiErrorKind> = {
  not_configured: 'not_configured',
  model_not_configured: 'not_configured',
  model_loading: 'not_configured',
  missing_path: 'invalid_request',
  path_not_allowed: 'invalid_request',
  missing_text: 'invalid_request',
  text_too_long: 'invalid_request',
  not_found: 'not_found',
  rate_limited: 'rate_limited',
  upstream_timeout: 'timeout',
  upstream_unreachable: 'network',
};

const kindFromStatus = (status: number): ApiErrorKind => {
  if (status === 404) return 'not_found';
  if (status === 429) return 'rate_limited';
  if (status === 503) return 'not_configured';
  if (status === 504) return 'timeout';
  if (status >= 400 && status < 500) return 'invalid_request';
  return 'server';
};

/** Normalise anything thrown by axios into an `ApiError`. */
export const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorBody>;

    if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
      return new ApiError('timeout', 'Request timed out.');
    }
    if (!axiosError.response) {
      return new ApiError('network', 'Network request failed.');
    }

    const { status, data } = axiosError.response;
    const code = data?.error?.code;
    const kind = (code && KIND_BY_CODE[code]) || kindFromStatus(status);
    return new ApiError(kind, data?.error?.message ?? 'Request failed.', status);
  }

  return new ApiError('server', 'Unexpected error.');
};

export const createApiClient = (baseURL: string, timeout = 12000): AxiosInstance =>
  axios.create({ baseURL, timeout, headers: { Accept: 'application/json' } });
