<script lang="ts">
  import type { ICategory } from "$lib/entities";
  import fish from "$lib/images/fish.webp";
  import ItemCard from "$lib/components/ItemCard.svelte";

  export let data: { categories: ICategory[] };
</script>

<svelte:head>
  <title>Categories</title>
  <meta name="Categories page" content="All categories" />
</svelte:head>

<section>
  <img id="main-banner" src={fish} alt="Fish in a market" />
  <div class="header-text">Categories</div>
  <div class="card-container">
    {#each data.categories as c}
      <ItemCard
        primaryText={c.name}
        imageURL={c.imgUrl}
        altText="Food"
        link={`/categories/${c.id}/restaurants`}
      />
    {/each}
  </div>
</section>
