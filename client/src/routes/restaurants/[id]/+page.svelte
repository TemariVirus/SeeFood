<script lang="ts">
  import type { IRestaurant } from "$lib/server/entities";
  import RestaurantInfo from "$lib/components/restaurantInfo.svelte";

  export let data: IRestaurant;
</script>

<svelte:head>
  <title>{data.name}</title>
  <meta name="Restaurant page" content="{data.name} details" />
</svelte:head>

<section>
  <RestaurantInfo restaurant={data} />
</section>
