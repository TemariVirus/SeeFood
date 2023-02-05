<script lang="ts">
  import CommentEditor from "$lib/components/commentEditor.svelte";
  import Comment from "$lib/components/comment.svelte";
  import type { IRestaurant, IComment } from "$lib/entities";
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
  <CommentEditor edit={false} />

  <div class="comment-container">
    {#if comments.length === 0}
      <p class="text-center text-l">No comments</p>
    {:else}
      {#each comments as comment}
        <Comment {comment} />
      {/each}
    {/if}
  </div>
</RestaurantInfo>

<style>
  .comment-container {
    margin-bottom: 1rem;
  }
</style>
