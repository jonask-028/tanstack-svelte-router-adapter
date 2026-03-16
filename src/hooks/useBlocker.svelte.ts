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
import type {
  AnyRoute,
  AnyRouter,
  ParseRoute,
  RegisteredRouter,
} from "@tanstack/router-core";
import type {
  BlockerFnArgs,
  HistoryAction,
  HistoryLocation,
} from "@tanstack/history";

// ---------------------------------------------------------------------------
// Types — mirrors React adapter's useBlocker types
// ---------------------------------------------------------------------------

interface ShouldBlockFnLocation<
  out TRouteId,
  out TFullPath,
  out TAllParams,
  out TFullSearchSchema,
> {
  routeId: TRouteId;
  fullPath: TFullPath;
  pathname: string;
  params: TAllParams;
  search: TFullSearchSchema;
}

type AnyShouldBlockFnLocation = ShouldBlockFnLocation<any, any, any, any>;

type MakeShouldBlockFnLocationUnion<
  TRouter extends AnyRouter = RegisteredRouter,
  TRoute extends AnyRoute = ParseRoute<TRouter["routeTree"]>,
> = TRoute extends any
  ? ShouldBlockFnLocation<
      TRoute["id"],
      TRoute["fullPath"],
      TRoute["types"]["allParams"],
      TRoute["types"]["fullSearchSchema"]
    >
  : never;

export type BlockerResolver<TRouter extends AnyRouter = RegisteredRouter> =
  | {
      status: "blocked";
      current: MakeShouldBlockFnLocationUnion<TRouter>;
      next: MakeShouldBlockFnLocationUnion<TRouter>;
      action: HistoryAction;
      proceed: () => void;
      reset: () => void;
    }
  | {
      status: "idle";
      current: undefined;
      next: undefined;
      action: undefined;
      proceed: undefined;
      reset: undefined;
    };

type ShouldBlockFnArgs<TRouter extends AnyRouter = RegisteredRouter> = {
  current: MakeShouldBlockFnLocationUnion<TRouter>;
  next: MakeShouldBlockFnLocationUnion<TRouter>;
  action: HistoryAction;
};

export type ShouldBlockFn<TRouter extends AnyRouter = RegisteredRouter> = (
  args: ShouldBlockFnArgs<TRouter>,
) => boolean | Promise<boolean>;

export type UseBlockerOpts<
  TRouter extends AnyRouter = RegisteredRouter,
  TWithResolver extends boolean = boolean,
> = {
  shouldBlockFn: ShouldBlockFn<TRouter>;
  enableBeforeUnload?: boolean | (() => boolean);
  disabled?: boolean;
  withResolver?: TWithResolver;
};

// ---------------------------------------------------------------------------
// Legacy types (deprecated)
// ---------------------------------------------------------------------------

type LegacyBlockerFn = () => Promise<any> | any;

type LegacyBlockerOpts = {
  blockerFn?: LegacyBlockerFn;
  condition?: boolean | any;
};

/** @deprecated — use BlockerResolver instead */
export type BlockerState = BlockerResolver;

// ---------------------------------------------------------------------------
// Internal: resolve legacy opts to modern opts
// ---------------------------------------------------------------------------

function _resolveBlockerOpts(
  opts?: UseBlockerOpts | LegacyBlockerOpts | LegacyBlockerFn,
  condition?: boolean | any,
): UseBlockerOpts {
  if (opts === undefined) {
    return {
      shouldBlockFn: () => true,
      withResolver: false,
    };
  }

  if ("shouldBlockFn" in opts) {
    return opts as UseBlockerOpts;
  }

  if (typeof opts === "function") {
    const shouldBlock = Boolean(condition ?? true);
    const _customBlockerFn = async () => {
      if (shouldBlock) return await (opts as LegacyBlockerFn)();
      return false;
    };

    return {
      shouldBlockFn: _customBlockerFn,
      enableBeforeUnload: shouldBlock,
      withResolver: false,
    };
  }

  const legacyOpts = opts as LegacyBlockerOpts;
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

// ---------------------------------------------------------------------------
// useBlocker
// ---------------------------------------------------------------------------

/**
 * Hook that blocks navigation based on a `shouldBlockFn` predicate.
 *
 * Must be called during component initialization (in `<script>` block)
 * because it accesses the router context.
 *
 * The returned object is reactive — status changes will trigger re-renders.
 *
 * @example Modern API:
 * ```ts
 * const blocker = useBlocker({
 *   shouldBlockFn: ({ current, next }) => current.routeId !== next.routeId,
 *   withResolver: true,
 * })
 * ```
 */
export function useBlocker<
  TRouter extends AnyRouter = RegisteredRouter,
  TWithResolver extends boolean = false,
>(
  opts: UseBlockerOpts<TRouter, TWithResolver>,
): TWithResolver extends true ? BlockerResolver<TRouter> : void;

/**
 * @deprecated Use the shouldBlockFn property instead
 */
export function useBlocker(
  blockerFnOrOpts?: LegacyBlockerOpts,
): BlockerResolver;

/**
 * @deprecated Use the UseBlockerOpts object syntax instead
 */
export function useBlocker(
  blockerFn?: LegacyBlockerFn,
  condition?: boolean | any,
): BlockerResolver;

export function useBlocker(
  opts?: UseBlockerOpts | LegacyBlockerOpts | LegacyBlockerFn,
  condition?: boolean | any,
): BlockerResolver | void {
  const {
    shouldBlockFn,
    enableBeforeUnload = true,
    disabled = false,
    withResolver = false,
  } = _resolveBlockerOpts(opts, condition);

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
    } as BlockerResolver;
  }

  // Reactive state for the resolver pattern using Svelte 5 runes
  let resolverStatus = $state<"idle" | "blocked">("idle");
  let resolverCurrent = $state<AnyShouldBlockFnLocation | undefined>(undefined);
  let resolverNext = $state<AnyShouldBlockFnLocation | undefined>(undefined);
  let resolverAction = $state<HistoryAction | undefined>(undefined);
  let resolverResolve: ((canNavigate: boolean) => void) | null = null;

  function getLocation(location: HistoryLocation): AnyShouldBlockFnLocation {
    const parsedLocation = (router as any).parseLocation(location);
    const matchedRoutes = (router as any).getMatchedRoutes(
      parsedLocation.pathname,
    );

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

  const blockerFnComposed = async (blockerFnArgs: BlockerFnArgs) => {
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
    } as any);

    if (!withResolver) {
      return shouldBlock;
    }

    if (!shouldBlock) {
      return false;
    }

    // Enter blocked state and wait for user to resolve
    const promise = new Promise<boolean>((resolve) => {
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
      if (resolverStatus !== "blocked") return undefined;
      return () => {
        if (resolverResolve) {
          resolverResolve(false); // false = don't block (allow navigation)
        }
      };
    },
    get reset() {
      if (resolverStatus !== "blocked") return undefined;
      return () => {
        if (resolverResolve) {
          resolverResolve(true); // true = block (cancel navigation)
        }
      };
    },
  } as BlockerResolver;
}
