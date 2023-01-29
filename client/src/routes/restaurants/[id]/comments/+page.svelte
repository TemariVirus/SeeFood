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
  <meta name="Restaurant page" content="{restaurant.name} details and comments" />
</svelte:head>

<section>
  <RestaurantInfo {restaurant} {comments} />
</section>
