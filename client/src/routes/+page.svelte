<script lang="ts">
  import { restaurantGetUrl } from "../lib/urls";
  import type { IRestaurant } from "../lib/entities";
  import fish from "../lib/images/fish.png";
  import SearchBar from "../lib/components/SearchBar.svelte";
  import ItemCard from "../lib/components/ItemCard.svelte";

  let restaurants: IRestaurant[] = [];

  fetch(restaurantGetUrl)
    .then((res) => res.json())
    .then((data) => restaurants = data);
</script>

<svelte:head>
  <title>Home</title>
  <meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
  <img id="main-banner" src={fish} alt="Fish in a market" />
  <SearchBar />
  <div class="header-text">Browse</div>
  <div class="restaurant-cards">
    {#each restaurants as r}
      <ItemCard
        primaryText={r.name}
        secondaryText={r.categories.join(", ")}
        imageURL={r.logo_url}
        link={`/restaurants/${r.id}`} />
    {/each}
  </div>
</section>

<style>
  section {
    position: absolute;
    margin: 0%;
    padding: 0%;
    width: 100%;
    top: var(--header-height);
    left: 0;
    color: var(--text-color);
  }

  #main-banner {
    width: 100vw;
    height: 11.25rem;
    object-fit: none;
    object-position: center;
  }

  .header-text {
    margin: 0.5625rem;
    font-size: 3rem;
    font-family: var(--emphasis-fonts);
    align-self: center;
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
