import type { AnyRoute, AnyRouter, ParseRoute, RegisteredRouter } from "@tanstack/router-core";
import type { HistoryAction } from "@tanstack/history";
interface ShouldBlockFnLocation<out TRouteId, out TFullPath, out TAllParams, out TFullSearchSchema> {
    routeId: TRouteId;
    fullPath: TFullPath;
    pathname: string;
    params: TAllParams;
    search: TFullSearchSchema;
}
type MakeShouldBlockFnLocationUnion<TRouter extends AnyRouter = RegisteredRouter, TRoute extends AnyRoute = ParseRoute<TRouter["routeTree"]>> = TRoute extends any ? ShouldBlockFnLocation<TRoute["id"], TRoute["fullPath"], TRoute["types"]["allParams"], TRoute["types"]["fullSearchSchema"]> : never;
export type BlockerResolver<TRouter extends AnyRouter = RegisteredRouter> = {
    status: "blocked";
    current: MakeShouldBlockFnLocationUnion<TRouter>;
    next: MakeShouldBlockFnLocationUnion<TRouter>;
    action: HistoryAction;
    proceed: () => void;
    reset: () => void;
} | {
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
export type ShouldBlockFn<TRouter extends AnyRouter = RegisteredRouter> = (args: ShouldBlockFnArgs<TRouter>) => boolean | Promise<boolean>;
export type UseBlockerOpts<TRouter extends AnyRouter = RegisteredRouter, TWithResolver extends boolean = boolean> = {
    shouldBlockFn: ShouldBlockFn<TRouter>;
    enableBeforeUnload?: boolean | (() => boolean);
    disabled?: boolean;
    withResolver?: TWithResolver;
};
type LegacyBlockerFn = () => Promise<any> | any;
type LegacyBlockerOpts = {
    blockerFn?: LegacyBlockerFn;
    condition?: boolean | any;
};
/** @deprecated — use BlockerResolver instead */
export type BlockerState = BlockerResolver;
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
export declare function useBlocker<TRouter extends AnyRouter = RegisteredRouter, TWithResolver extends boolean = false>(opts: UseBlockerOpts<TRouter, TWithResolver>): TWithResolver extends true ? BlockerResolver<TRouter> : void;
/**
 * @deprecated Use the shouldBlockFn property instead
 */
export declare function useBlocker(blockerFnOrOpts?: LegacyBlockerOpts): BlockerResolver;
/**
 * @deprecated Use the UseBlockerOpts object syntax instead
 */
export declare function useBlocker(blockerFn?: LegacyBlockerFn, condition?: boolean | any): BlockerResolver;
export {};
//# sourceMappingURL=useBlocker.svelte.d.ts.map