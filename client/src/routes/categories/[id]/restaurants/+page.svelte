<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import type { IRestaurant, ICategory } from "$lib/server/entities";
  import fish from "$lib/images/fish.png";
  import SearchBar from "$lib/components/SearchBar.svelte";
  import ItemCard from "$lib/components/ItemCard.svelte";

  export let data: { category: ICategory; restaurants: IRestaurant[] };

  let restaurantSearch = (searchTerm: any) => {
    goto(`/categories/${$page.params.id}/restaurants?search=${searchTerm}`);
    return undefined;
  };
</script>

<svelte:head>
  <title>{data.category.name}</title>
  <meta name="Home page" content="All restaurants" />
</svelte:head>

<section>
  <img id="main-banner" src={fish} alt="Fish in a market" />
  <SearchBar search={restaurantSearch} />
  <p class="header-text">{data.category.name}</p>
  <div class="card-container">
    {#each data.restaurants as r}
      <ItemCard
        primaryText={r.name}
        secondaryText={r.categories.join(", ")}
        imageURL={r.logoUrl}
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
