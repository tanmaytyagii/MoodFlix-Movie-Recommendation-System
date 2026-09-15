import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import tmdbHandler from './tmdb.js';
import emotionHandler from './emotion.js';

/**
 * Deployment-contract tests for the serverless functions.
 *
 * These exist because of a real production outage: `api/tmdb.ts` imported
 * `'./_shared'` without a file extension. That type-checks, lints, builds, and
 * works in dev (Vite resolves it), but package.json sets `"type": "module"`, so
 * Vercel's Node runtime loads the compiled output as strict ESM — where a
 * relative specifier without an extension throws ERR_MODULE_NOT_FOUND at module
 * load. Every request returned 500 FUNCTION_INVOCATION_FAILED before a single
 * line of handler code ran.
 *
 * Nothing else in the toolchain catches this, so it is asserted here.
 */

const API_DIR = join(process.cwd(), 'api');

const sourceFiles = readdirSync(API_DIR).filter(
  (file) => file.endsWith('.ts') && !file.endsWith('.test.ts'),
);

/** Files Vercel exposes as routes: everything not prefixed with an underscore. */
const routeFiles = sourceFiles.filter((file) => !file.startsWith('_'));

const read = (file: string) => readFileSync(join(API_DIR, file), 'utf8');

const RELATIVE_IMPORT = /(?:import|export)[^'"]*from\s+['"](\.[^'"]*)['"]/g;

describe('ESM module resolution', () => {
  it('finds the serverless source files', () => {
    expect(sourceFiles.length).toBeGreaterThan(0);
  });

  it.each(sourceFiles)('%s imports relative modules with an explicit extension', (file) => {
    const specifiers = [...read(file).matchAll(RELATIVE_IMPORT)].map((match) => match[1]);
    for (const specifier of specifiers) {
      expect(
        specifier.endsWith('.js'),
        `"${specifier}" in api/${file} needs an explicit .js extension or it will throw ` +
          'ERR_MODULE_NOT_FOUND on Vercel',
      ).toBe(true);
    }
  });

  it('is running against a package that really is ESM', () => {
    // If this ever flips to CommonJS the rule above stops being load-bearing.
    const pkg: unknown = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
    expect((pkg as { type?: string }).type).toBe('module');
  });
});

describe('Vercel function exports', () => {
  it.each(routeFiles)('%s has a default export', (file) => {
    expect(read(file)).toMatch(/export default /);
  });

  // Imported statically so this also proves the specifiers above actually resolve.
  it.each([
    ['tmdb.ts', tmdbHandler],
    ['emotion.ts', emotionHandler],
  ])('%s default export is a (req, res) handler', (_file, handler) => {
    expect(typeof handler).toBe('function');
    // Vercel's Node runtime invokes handlers as (req, res).
    expect(handler.length).toBe(2);
  });

  it('covers every route file with a signature assertion', () => {
    expect(routeFiles.sort()).toEqual(['emotion.ts', 'tmdb.ts']);
  });

  /**
   * Test files must never become routes: they have no default export and import
   * vitest, so Vercel's function build would fail on them.
   */
  it('keeps every test file underscore-prefixed', () => {
    const tests = readdirSync(API_DIR).filter((file) => file.endsWith('.test.ts'));
    expect(tests.length).toBeGreaterThan(0);
    for (const file of tests) expect(file.startsWith('_')).toBe(true);
  });
});
