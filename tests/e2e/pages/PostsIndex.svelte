<!--
  Test page component — Posts index (listing).
  Used in E2E integration tests.
-->
<script lang="ts">
  import Link from "../../../src/components/Link.svelte";
</script>

<div data-testid="posts-index">
  <ul>
    <li>
      <Link to="/posts/$postId" params={{ postId: "1" }}>
        {#snippet children({ isActive })}
          <span data-testid="post-link-1">Post 1</span>
        {/snippet}
      </Link>
    </li>
    <li>
      <Link to="/posts/$postId" params={{ postId: "2" }}>
        {#snippet children({ isActive })}
          <span data-testid="post-link-2">Post 2</span>
        {/snippet}
      </Link>
    </li>
  </ul>
</div>
