<script lang="ts">
  import { page } from "$app/stores";
  import type { IRestaurant } from "$lib/server/entities";
  import RestaurantInfo from "$lib/components/restaurantInfo.svelte";

  export let data: IRestaurant;
</script>

<svelte:head>
  <title>{data.name}</title>
  <meta name="Restaurant page" content="{data.name} details" />
</svelte:head>

<RestaurantInfo restaurant={data}>
  <a href="{$page.url.href}/comments#reviews">Show Reviews</a>
</RestaurantInfo>
