<script lang="ts">
  import Header from "./lib/Header.svelte";
  import fish from "./assets/fish.png";
  import SearchBar from "./lib/SearchBar.svelte";
  import ItemCard from "./lib/ItemCard.svelte";

  fetch("http://localhost:8000/restaurants")
    .then((res) => res.json())
    .then((data) => {
      populateCards(data);
    });

  function populateCards(data) {
    // Wait for dom to load
    if (document.readyState !== "complete") {
      setTimeout(() => populateCards(data), 0);
      return;
    }

    const cards = document.getElementById("restaurants");
    data.forEach((restaurant) => {
      new ItemCard({
        target: cards,
        props: {
          primaryText: restaurant.name,
          secondaryText: restaurant.categories.join(", "),
          imageURL: restaurant.logo_url,
          link: `/restaurants/${restaurant.id}`,
        },
      });
    });
  }
</script>

<Header />

<main>
  <img id="main-banner" src={fish} alt="Fish in a market" />
  <SearchBar />
  <div class="header-text">Browse</div>
  <div id="restaurants" class="restaurant-cards" />
</main>

<style>
  main {
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
