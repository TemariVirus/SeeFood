<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import type { IRestaurant } from "$lib/entities";
  import fish from "$lib/images/fish.webp";
  import SearchBar from "$lib/components/SearchBar.svelte";
  import ItemCard from "$lib/components/ItemCard.svelte";

  export let headerText: string;
  export let restaurants: IRestaurant[];

  let restaurantSearch = (searchTerm: any) => {
    goto(`${$page.url.pathname}?search=${searchTerm}`);
    return undefined;
  };
</script>

<img id="main-banner" src={fish} alt="Fish in a market" />
<SearchBar search={restaurantSearch} />
<p class="header-text">{headerText}</p>
{#if restaurants.length === 0}
  <p class="text-center text-l">No restaurants found</p>
{:else}
  <div class="card-container">
    {#each restaurants as r}
      <ItemCard
        primaryText={r.name}
        secondaryText={r.categories.join(", ")}
        imageURL={r.logoUrl}
        altText="Logo"
        link={`/restaurants/${r.id}`}
      />
    {/each}
  </div>
{/if}
