/**
 * Minimal request/response shapes shared by the serverless handlers.
 *
 * Deliberately structural rather than importing `@vercel/node`: the same
 * handlers are mounted by the Vite dev middleware (see `vite.config.ts`) against
 * Node's own `http` objects, and both satisfy these interfaces.
 */
export interface ProxyRequest {
  url?: string;
  method?: string;
  /** Vercel pre-parses JSON bodies; in dev we read the stream instead. */
  body?: unknown;
}

export interface ProxyResponse {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(body?: string): void;
}

export interface ProxyResult {
  status: number;
  /** Already-serialised JSON body. */
  body: string;
  /** Cache-Control value, when the response is safe to cache. */
  cacheControl?: string;
}

export const jsonError = (status: number, message: string, code: string): ProxyResult => ({
  status,
  body: JSON.stringify({ error: { code, message } }),
});

/** Parse a handler's request URL. The base is irrelevant — only path/query are read. */
export const parseUrl = (req: ProxyRequest): URL => new URL(req.url ?? '/', 'http://localhost');

const isAsyncIterable = (value: unknown): value is AsyncIterable<Uint8Array | string> =>
  typeof value === 'object' && value !== null && Symbol.asyncIterator in value;

/** Read a JSON request body from either a pre-parsed field or the raw stream. */
export const readJsonBody = async (req: ProxyRequest): Promise<Record<string, unknown>> => {
  if (req.body && typeof req.body === 'object') return req.body as Record<string, unknown>;

  let raw = typeof req.body === 'string' ? req.body : '';
  if (!raw && isAsyncIterable(req)) {
    const chunks: string[] = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk));
    }
    raw = chunks.join('');
  }

  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
};

interface HandlerOptions {
  method?: 'GET' | 'POST';
}

/**
 * Adapt a pure core function into a Node-style handler.
 * Keeps every handler's transport concerns in exactly one place.
 */
export const createHandler = (
  core: (url: URL, body: Record<string, unknown>) => Promise<ProxyResult>,
  options: HandlerOptions = {},
) => {
  const allowed = options.method ?? 'GET';

  return async (req: ProxyRequest, res: ProxyResponse): Promise<void> => {
    if (req.method && req.method !== allowed) {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Allow', allowed);
      res.end(JSON.stringify({ error: { code: 'method_not_allowed', message: `Only ${allowed} is supported.` } }));
      return;
    }

    let result: ProxyResult;
    try {
      const body = allowed === 'POST' ? await readJsonBody(req) : {};
      result = await core(parseUrl(req), body);
    } catch {
      // Never surface the thrown value: it can contain the outbound request,
      // including the Authorization header.
      result = jsonError(502, 'Upstream request failed.', 'upstream_error');
    }

    res.statusCode = result.status;
    res.setHeader('Content-Type', 'application/json');
    if (result.cacheControl) res.setHeader('Cache-Control', result.cacheControl);
    res.end(result.body);
  };
};
