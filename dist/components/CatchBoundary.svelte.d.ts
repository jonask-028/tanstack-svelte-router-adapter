import type { Snippet, Component } from "svelte";
type $$ComponentProps = {
    children: Snippet;
    errorComponent?: Component<{
        error: Error;
        reset: () => void;
    }>;
    onCatch?: (error: Error) => void;
};
declare const CatchBoundary: Component<$$ComponentProps, {}, "">;
type CatchBoundary = ReturnType<typeof CatchBoundary>;
export default CatchBoundary;
//# sourceMappingURL=CatchBoundary.svelte.d.ts.map