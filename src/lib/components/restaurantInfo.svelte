<script lang="ts">
  import type { IRestaurant } from "$lib/entities";

  export let restaurant: IRestaurant;
</script>

<section>
  <div class="info-container">
    <img class="main-img" src={restaurant.mainImgUrl} alt="In the restaurant" />
    <p class="text-xl no-margin">{restaurant.name}</p>
    <p class="text-m">{restaurant.categories}</p>

    <div id="rating" />
    <div>
      <p>Opening Hours: {restaurant.openingHours}</p>
      <p>Telephone No.: {restaurant.telephoneNo}</p>
      <p>
        Website: <a href="http://{restaurant.website}">{restaurant.website}</a>
      </p>
    </div>

    <p class="text-l">About</p>
    <p>{restaurant.description}</p>

    <p id="reviews" class="text-l">Reviews</p>
    <slot />
  </div>
</section>

<style>
  p {
    margin: 0;
    margin-bottom: 1.125rem;
    padding: auto;
    white-space: pre-line;
  }

  .info-container {
    padding-left: 3.75rem;
    padding-right: 3.75rem;
    margin-bottom: 1rem;
    display: flex;
    justify-items: center;
    align-items: left;
    flex-direction: column;
    word-wrap: break-word;
  }

  .main-img {
    height: 22.5rem;
    max-height: 22.5rem;
    align-self: center;
    object-fit: contain;
    object-position: center;
  }
</style>