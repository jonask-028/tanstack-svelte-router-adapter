/**
 * useBlocker — Navigation blocking hook for Svelte 5.
 *
 * Blocks navigation when `shouldBlockFn` returns true. Provides
 * `proceed()` / `reset()` controls when `withResolver: true`.
 *
 * Uses router.history.block() from @tanstack/history internally.
 *
 * @example Modern API (recommended):
 * ```svelte
 * <script lang="ts">
 *   import { useBlocker } from '@tanstack/svelte-router'
 *
 *   let formDirty = $state(false)
 *   const blocker = useBlocker({
 *     shouldBlockFn: () => formDirty,
 *     withResolver: true,
 *   })
 * </script>
 *
 * {#if blocker.status === 'blocked'}
 *   <dialog open>
 *     <p>Unsaved changes! Leave anyway?</p>
 *     <button onclick={blocker.proceed}>Leave</button>
 *     <button onclick={blocker.reset}>Stay</button>
 *   </dialog>
 * {/if}
 * ```
 *
 * @example Legacy API (deprecated):
 * ```svelte
 * <script lang="ts">
 *   import { useBlocker } from '@tanstack/svelte-router'
 *
 *   let formDirty = $state(false)
 *   const blocker = useBlocker({ condition: formDirty })
 * </script>
 * ```
 */
import { useRouter } from "./useRouter.js";
// ---------------------------------------------------------------------------
// Internal: resolve legacy opts to modern opts
// ---------------------------------------------------------------------------
function _resolveBlockerOpts(opts, condition) {
    if (opts === undefined) {
        return {
            shouldBlockFn: () => true,
            withResolver: false,
        };
    }
    if ("shouldBlockFn" in opts) {
        return opts;
    }
    if (typeof opts === "function") {
        const shouldBlock = Boolean(condition ?? true);
        const _customBlockerFn = async () => {
            if (shouldBlock)
                return await opts();
            return false;
        };
        return {
            shouldBlockFn: _customBlockerFn,
            enableBeforeUnload: shouldBlock,
            withResolver: false,
        };
    }
    const legacyOpts = opts;
    const shouldBlock = Boolean(legacyOpts.condition ?? true);
    const fn = legacyOpts.blockerFn;
    const _customBlockerFn = async () => {
        if (shouldBlock && fn !== undefined) {
            return await fn();
        }
        return shouldBlock;
    };
    return {
        shouldBlockFn: _customBlockerFn,
        enableBeforeUnload: shouldBlock,
        withResolver: fn === undefined,
    };
}
export function useBlocker(opts, condition) {
    const { shouldBlockFn, enableBeforeUnload = true, disabled = false, withResolver = false, } = _resolveBlockerOpts(opts, condition);
    const router = useRouter();
    const { history } = router;
    if (disabled) {
        return {
            status: "idle",
            current: undefined,
            next: undefined,
            action: undefined,
            proceed: undefined,
            reset: undefined,
        };
    }
    // Reactive state for the resolver pattern using Svelte 5 runes
    let resolverStatus = $state("idle");
    let resolverCurrent = $state(undefined);
    let resolverNext = $state(undefined);
    let resolverAction = $state(undefined);
    let resolverResolve = null;
    function getLocation(location) {
        const parsedLocation = router.parseLocation(location);
        const matchedRoutes = router.getMatchedRoutes(parsedLocation.pathname);
        if (matchedRoutes.foundRoute === undefined) {
            return {
                routeId: "__notFound__",
                fullPath: parsedLocation.pathname,
                pathname: parsedLocation.pathname,
                params: matchedRoutes.routeParams,
                search: router.options.parseSearch(location.search),
            };
        }
        return {
            routeId: matchedRoutes.foundRoute.id,
            fullPath: matchedRoutes.foundRoute.fullPath,
            pathname: parsedLocation.pathname,
            params: matchedRoutes.routeParams,
            search: router.options.parseSearch(location.search),
        };
    }
    const blockerFnComposed = async (blockerFnArgs) => {
        const current = getLocation(blockerFnArgs.currentLocation);
        const next = getLocation(blockerFnArgs.nextLocation);
        // Don't block when navigating away from a not-found to a valid route
        if (current.routeId === "__notFound__" && next.routeId !== "__notFound__") {
            return false;
        }
        const shouldBlock = await shouldBlockFn({
            action: blockerFnArgs.action,
            current,
            next,
        });
        if (!withResolver) {
            return shouldBlock;
        }
        if (!shouldBlock) {
            return false;
        }
        // Enter blocked state and wait for user to resolve
        const promise = new Promise((resolve) => {
            resolverStatus = "blocked";
            resolverCurrent = current;
            resolverNext = next;
            resolverAction = blockerFnArgs.action;
            resolverResolve = resolve;
        });
        const canNavigateAsync = await promise;
        // Reset resolver state
        resolverStatus = "idle";
        resolverCurrent = undefined;
        resolverNext = undefined;
        resolverAction = undefined;
        resolverResolve = null;
        return canNavigateAsync;
    };
    // Register the blocker with history
    history.block({
        blockerFn: blockerFnComposed,
        enableBeforeUnload,
    });
    // Return resolver object with getters that read reactive $state
    return {
        get status() {
            return resolverStatus;
        },
        get current() {
            return resolverCurrent;
        },
        get next() {
            return resolverNext;
        },
        get action() {
            return resolverAction;
        },
        get proceed() {
            if (resolverStatus !== "blocked")
                return undefined;
            return () => {
                if (resolverResolve) {
                    resolverResolve(false); // false = don't block (allow navigation)
                }
            };
        },
        get reset() {
            if (resolverStatus !== "blocked")
                return undefined;
            return () => {
                if (resolverResolve) {
                    resolverResolve(true); // true = block (cancel navigation)
                }
            };
        },
    };
}
