// Tiny scheduler to stagger ad iframe mounts so we don't boot many third-party
// scripts in the same frame. Caps concurrent "in flight" inits and uses
// requestIdleCallback when available so it never competes with main content.

type Task = () => void;

const MAX_CONCURRENT = 2;
const SPACING_MS = 180;

let active = 0;
const queue: Task[] = [];

const ric: (cb: () => void, opts?: { timeout: number }) => number =
  (typeof window !== "undefined" && (window as any).requestIdleCallback) ||
  ((cb: () => void) => window.setTimeout(cb, 1) as unknown as number);

function pump() {
  if (active >= MAX_CONCURRENT) return;
  const next = queue.shift();
  if (!next) return;
  active++;
  ric(
    () => {
      try { next(); } catch {}
      window.setTimeout(() => {
        active = Math.max(0, active - 1);
        pump();
      }, SPACING_MS);
    },
    { timeout: 1500 }
  );
}

export function scheduleAdMount(task: Task): () => void {
  let cancelled = false;
  const wrapped = () => { if (!cancelled) task(); };
  queue.push(wrapped);
  pump();
  return () => { cancelled = true; };
}
