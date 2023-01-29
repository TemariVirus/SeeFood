<script lang="ts">
  import CommentEditer from "$lib/components/commentEditer.svelte";
  import Comment from "$lib/components/comment.svelte";
  import type { IRestaurant, IComment } from "$lib/server/entities";
  import RestaurantInfo from "$lib/components/restaurantInfo.svelte";

  export let data: {
    restaurant: IRestaurant;
    comments: IComment[];
  };
  let { restaurant, comments } = data;
</script>

<svelte:head>
  <title>{restaurant.name}</title>
  <meta
    name="Restaurant page"
    content="{restaurant.name} details and comments"
  />
</svelte:head>

<RestaurantInfo {restaurant}>
  <CommentEditer />

  <div class="comment-container">
    {#if comments.length === 0}
      <p class="text-center text-l">No comments</p>
    {:else}
      {#each comments as comment}
        <Comment data={comment} />
      {/each}
    {/if}
  </div>
</RestaurantInfo>

<style>
  .comment-container {
    margin-bottom: 1rem;
  }
</style>
