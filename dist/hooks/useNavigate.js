import { useRouter } from "./useRouter.js";
/**
 * Get a navigate function to imperatively navigate between routes.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useNavigate } from '@tanstack/svelte-router'
 *   const navigate = useNavigate()
 *
 *   function goToOrgs() {
 *     navigate({ to: '/orgs' })
 *   }
 * </script>
 * ```
 */
export function useNavigate(opts) {
    const router = useRouter();
    return ((navOpts) => {
        return router.navigate({
            ...navOpts,
            from: navOpts.from ?? opts?.from,
        });
    });
}
