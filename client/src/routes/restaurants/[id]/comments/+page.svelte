<script lang="ts">
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
</svelte:head>

<section>
  <div class="info-container">
    <RestaurantInfo restaurant={restaurant} />

    {#each comments as comment}
      <div class="comment">
        <p>{comment.content}</p>
        <p>{comment.rating}</p>
      </div>
    {/each}
  </div>
</section>

<style>
  .info-container {
    padding-left: 3.75rem;
    padding-right: 3.75rem;
    display: flex;
    justify-items: center;
    align-items: left;
    flex-direction: column;
    word-wrap: break-word;
  }
</style>
