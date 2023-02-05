<script lang="ts">
  import type { IRestaurant } from "$lib/entities";
  import StarFull from "$lib/images/star-full.svg";
  import StarEmpty from "$lib/images/star-empty.svg";
  import Modal from "$lib/components/modal.svelte";

  export let restaurant: IRestaurant;
</script>

<section>
  <div class="info-container">
    <img class="main-img" src={restaurant.mainImgUrl} alt="In the restaurant" />
    <div style="display: flex; flex-direction: row;">
      <div style="margin: 0">
        <p
          style="text-align: left; margin-bottom: 0;"
          class="text-xl no-margin"
        >
          {restaurant.name}
        </p>
        <p class="text-m">{restaurant.categories.join(", ")}</p>
      </div>

      <div id="rating">
        <p>{Math.round(restaurant.rating * 10) / 10}{Math.round(restaurant.rating * 10) % 10 == 0 ? ".0" : ""}</p>
        <div style="display: flex; flex-direction: row;">
          {#each Array(5) as _}
            <img src={StarEmpty} alt="Star Empty" height="52" width="52" />
          {/each}
          <div style="display: flex; flex-direction: row; position: absolute">
            {#each Array(5) as _, i}
              <div style="width: 2.5rem">
                <div
                  style="width: {Math.min(1, Math.max(0, restaurant.rating - i)) * 2.5}rem;
                  overflow: hidden;"
                >
                  <img src={StarFull} alt="Star Full" height="52" width="52" />
                </div>
              </div>
            {/each}
          </div>
        </div>
        <p>({restaurant.reviewCount})</p>
      </div>
    </div>

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

  #rating {
    margin-left: auto;
    display: flex;
    align-items: center;
  }

  #rating p {
    font-size: 1.3125rem;
    margin: 0.5rem 0.4375rem;
  }

  #rating img {
    width: 2.5rem;
    height: 2.5rem;
    margin: 0;
  }
</style>
