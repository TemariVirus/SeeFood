<script lang="ts">
  import { goto } from "$app/navigation";
  import type { IRestaurant } from "$lib/entities";
  import fish from "$lib/images/fish.png";
  import SearchBar from "$lib/components/SearchBar.svelte";
  import ItemCard from "$lib/components/ItemCard.svelte";

  export let data: { restaurants: IRestaurant[] };

  let restaurantSearch = (searchTerm: any) => {
    goto(`/?search=${searchTerm}`);
    return undefined;
  };
</script>

<svelte:head>
  <title>SeeFood Restaurant Reviews</title>
  <meta name="Home page" content="All restaurants" />
</svelte:head>

<section>
  <img id="main-banner" src={fish} alt="Fish in a market" />
  <SearchBar search={restaurantSearch} />
  <p class="header-text">Browse</p>
  <div class="card-container">
    {#each data.restaurants as r}
      <ItemCard
        primaryText={r.name}
        secondaryText={r.categories.join(", ")}
        imageURL={r.logoUrl}
        altText="Logo"
        link={`/restaurants/${r.id}`}
      />
    {/each}
  </div>
</section>

<style>
  #main-banner {
    width: 100vw;
    height: 11.25rem;
    object-fit: cover;
    object-position: center;
  }
</style>
