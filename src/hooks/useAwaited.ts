import {
  TSR_DEFERRED_PROMISE,
  defer,
  type DeferredPromise,
} from "@tanstack/router-core";

export type AwaitOptions<T> = {
  promise: Promise<T>;
};

/**
 * Consume a deferred promise synchronously.
 *
 * If the promise is resolved, returns the data.
 * If the promise is pending, throws the promise (for use with Svelte's {#await}).
 * If the promise is rejected, throws the error.
 *
 * @example
 * ```typescript
 * import { useAwaited, defer } from '@tanstack/svelte-router'
 *
 * const data = useAwaited({ promise: defer(myAsyncFn()) })
 * ```
 */
export function useAwaited<T>({ promise: _promise }: AwaitOptions<T>): T {
  const promise = defer(_promise);

  if (promise[TSR_DEFERRED_PROMISE].status === "pending") {
    throw promise;
  }

  if (promise[TSR_DEFERRED_PROMISE].status === "error") {
    throw promise[TSR_DEFERRED_PROMISE].error;
  }

  return promise[TSR_DEFERRED_PROMISE].data;
}
