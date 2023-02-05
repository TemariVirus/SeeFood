<script lang="ts">
  import type { IRestaurant } from "$lib/entities";
  import RestaurantListing from "$lib/components/restaurantListing.svelte";

  export let data: { restaurants: IRestaurant[] };
</script>

<svelte:head>
  <title>SeeFood Restaurant Reviews</title>
  <meta name="Home page" content="All restaurants" />
</svelte:head>

<section>
  <RestaurantListing headerText="Browse" restaurants={data.restaurants} />
</section>
