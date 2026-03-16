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
export declare function useAwaited<T>({ promise: _promise }: AwaitOptions<T>): T;
//# sourceMappingURL=useAwaited.d.ts.map