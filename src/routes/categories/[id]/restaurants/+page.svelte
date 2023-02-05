<script lang="ts">
  import type { IRestaurant, ICategory } from "$lib/entities";
  import RestaurantListing from "$lib/components/restaurantListing.svelte";

  export let data: { category: ICategory; restaurants: IRestaurant[] };
</script>

<svelte:head>
  <title>{data.category.name}</title>
  <meta name="Home page" content="All restaurants" />
</svelte:head>

<section>
  <RestaurantListing
    headerText={data.category.name}
    restaurants={data.restaurants}
  />
</section>
