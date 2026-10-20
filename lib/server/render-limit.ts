const MAX_ACTIVE = 2;
const MAX_WAITING = 8;

/** Thrown when the render queue is full; the route answers 503. */
export class RenderBusyError extends Error {
  constructor() {
    super("Render queue is full");
    this.name = "RenderBusyError";
  }
}

let active = 0;
const waiting: (() => void)[] = [];

/**
 * Runs `task` with at most two renders at a time, queueing up to eight more.
 * Chrome memory is the limit on a small Render instance.
 */
export async function withRenderSlot<T>(task: () => Promise<T>): Promise<T> {
  if (active >= MAX_ACTIVE) {
    if (waiting.length >= MAX_WAITING) throw new RenderBusyError();
    await new Promise<void>((resolve) => waiting.push(resolve));
  } else {
    active++;
  }

  try {
    return await task();
  } finally {
    // Hand the slot straight to the next waiter, or free it.
    const next = waiting.shift();
    if (next) next();
    else active--;
  }
}
