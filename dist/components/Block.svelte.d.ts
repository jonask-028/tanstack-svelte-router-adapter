import type { Snippet } from "svelte";
import { type BlockerResolver, type ShouldBlockFn } from "../hooks/useBlocker.svelte.js";
type $$ComponentProps = {
    shouldBlockFn?: ShouldBlockFn;
    disabled?: boolean;
    enableBeforeUnload?: boolean | (() => boolean);
    withResolver?: boolean;
    /** @deprecated Use shouldBlockFn instead */
    condition?: boolean;
    /** @deprecated Use shouldBlockFn instead */
    blockerFn?: () => Promise<any> | any;
    children?: Snippet<[BlockerResolver]>;
};
declare const Block: import("svelte").Component<$$ComponentProps, {}, "">;
type Block = ReturnType<typeof Block>;
export default Block;
//# sourceMappingURL=Block.svelte.d.ts.map