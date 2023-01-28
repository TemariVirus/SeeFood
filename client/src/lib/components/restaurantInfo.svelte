<script lang="ts">
  import type { IRestaurant } from "$lib/server/entities";

  export let restaurant: IRestaurant;
</script>

<img class="main-img" src={restaurant.main_img_url} alt="In the restaurant" />
<p id="name">{restaurant.name}</p>
<p id="categories">{restaurant.categories}</p>

<div id="rating" />
<div id="details">
  <p id="opening-hours">Opening Hours: {restaurant.opening_hours}</p>
  <p id="phone">Telephone No.: {restaurant.telephone_no}</p>
  <p id="website">
    Website: <a href="http://{restaurant.website}">{restaurant.website}</a>
  </p>
</div>

<p id="about">About</p>
<p id="about-text">{restaurant.description}</p>

<p id="reviews">Reviews</p>
<div class="write-a-review" />

<style>
  p {
    margin: 0;
    padding: auto;
    margin-bottom: 1.125rem;
  }

  .main-img {
    height: 22.5rem;
    max-height: 22.5rem;
    align-self: center;
    object-fit: contain;
    object-position: center;
  }

  #name {
    font-size: 2.25rem;
    margin: 0;
  }

  #categories {
    font-size: 1.5rem;
  }

  #about {
    font-size: 1.6875rem;
  }

  #reviews {
    font-size: 1.6875rem;
  }
</style>
