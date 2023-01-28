<script lang="ts">
  import { page } from "$app/stores";
  import type { IRestaurant } from "$lib/server/entities";
  import RestaurantInfo from "$lib/components/restaurantInfo.svelte";

  export let data: IRestaurant;
</script>

<svelte:head>
  <title>{data.name}</title>
</svelte:head>

<section>
  <div class="info-container">
    <RestaurantInfo restaurant={data} />

    <a href="{$page.url.href}/comments">Show Reviews</a>
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
