import { useEffect, useRef } from 'react';

/** Only devices that can actually hover with a precise pointer get the effect. */
const FINE_POINTER = '(hover: hover) and (pointer: fine)';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

interface TiltOptions {
  /** Maximum rotation on each axis, in degrees. Kept small on purpose. */
  max?: number;
}

/**
 * Cursor-follow tilt for a card.
 *
 * Writes `--rx` / `--ry` custom properties that the `.tilt` class consumes, so
 * React never re-renders while the pointer moves — the browser only recomputes
 * a compositor transform.
 *
 * Deliberately inert on touch devices and when the user prefers reduced motion:
 * in both cases no listeners are attached at all, and the element stays flat
 * because the custom properties keep their `0deg` defaults.
 *
 * Performance notes:
 *  - the element rect is measured once per hover, not per pointer event, so
 *    moving the cursor never forces a layout read;
 *  - updates are coalesced into one `requestAnimationFrame` per frame;
 *  - `pointermove` is only bound while the pointer is actually over the card.
 */
export const useTilt = <T extends HTMLElement>({ max = 3 }: TiltOptions = {}) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof window.matchMedia !== 'function') return;

    const fine = window.matchMedia(FINE_POINTER);
    const reduced = window.matchMedia(REDUCED_MOTION);

    let frame = 0;
    let rect: DOMRect | null = null;
    let next: { x: number; y: number } | null = null;

    const paint = () => {
      frame = 0;
      if (!next || !rect) return;
      // Map cursor position within the card to -1..1 on each axis.
      const px = (next.x - rect.left) / rect.width - 0.5;
      const py = (next.y - rect.top) / rect.height - 0.5;
      // Pointer above centre should tip the top away, hence the negation.
      element.style.setProperty('--rx', `${(-py * max).toFixed(2)}deg`);
      element.style.setProperty('--ry', `${(px * max).toFixed(2)}deg`);
    };

    const onMove = (event: PointerEvent) => {
      next = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const onEnter = (event: PointerEvent) => {
      rect = element.getBoundingClientRect();
      element.dataset.tilting = 'true';
      element.addEventListener('pointermove', onMove);
      onMove(event);
    };

    const reset = () => {
      element.removeEventListener('pointermove', onMove);
      element.dataset.tilting = 'false';
      element.style.setProperty('--rx', '0deg');
      element.style.setProperty('--ry', '0deg');
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      rect = null;
      next = null;
    };

    const enable = () => {
      element.addEventListener('pointerenter', onEnter);
      element.addEventListener('pointerleave', reset);
      // Scrolling can move the card out from under a stationary cursor.
      element.addEventListener('pointercancel', reset);
    };

    const disable = () => {
      element.removeEventListener('pointerenter', onEnter);
      element.removeEventListener('pointerleave', reset);
      element.removeEventListener('pointercancel', reset);
      reset();
    };

    const sync = () => {
      if (fine.matches && !reduced.matches) enable();
      else disable();
    };

    sync();
    fine.addEventListener('change', sync);
    reduced.addEventListener('change', sync);

    return () => {
      fine.removeEventListener('change', sync);
      reduced.removeEventListener('change', sync);
      disable();
    };
  }, [max]);

  return ref;
};
