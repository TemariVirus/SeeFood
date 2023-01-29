<script lang="ts">
  import type { IRestaurant } from "$lib/server/entities";
  import fish from "$lib/images/fish.png";
  import SearchBar from "$lib/components/SearchBar.svelte";
  import ItemCard from "$lib/components/ItemCard.svelte";

  export let data: { restaurants: IRestaurant[] };
</script>

<svelte:head>
  <title>SeeFood Restaurant Reviews</title>
  <meta name="Home page" content="All restaurants" />
</svelte:head>

<section>
  <img id="main-banner" src={fish} alt="Fish in a market" />
  <SearchBar />
  <div class="header-text">Browse</div>
  <div class="restaurant-cards">
    {#each data.restaurants as r}
      <ItemCard
        primaryText={r.name}
        secondaryText={r.categories.join(", ")}
        imageURL={r.logo_url}
        link={`/restaurants/${r.id}`}
      />
    {/each}
  </div>
</section>

<style>
  #main-banner {
    width: 100vw;
    height: 11.25rem;
    object-fit: none;
    object-position: center;
  }

  .restaurant-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(17.25rem, 1fr));
    grid-gap: 0.5625rem;
    justify-items: center;
    align-items: center;
    align-content: center;
    margin: 2.4375rem;
  }
</style>
