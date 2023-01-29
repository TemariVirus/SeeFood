<script lang="ts">
  import { page } from "$app/stores";
  import Comment from "$lib/components/comment.svelte";
  import type { IRestaurant, IComment } from "$lib/server/entities";

  export let restaurant: IRestaurant;
  export let comments: undefined | IComment[] = undefined;
</script>

<div class="info-container">
  <img class="main-img" src={restaurant.main_img_url} alt="In the restaurant" />
  <p class="text-xl no-margin">{restaurant.name}</p>
  <p class="text-m">{restaurant.categories}</p>

  <div id="rating" />
  <div>
    <p>Opening Hours: {restaurant.opening_hours}</p>
    <p>Telephone No.: {restaurant.telephone_no}</p>
    <p>
      Website: <a href="http://{restaurant.website}">{restaurant.website}</a>
    </p>
  </div>

  <p class="text-l">About</p>
  <p>{restaurant.description}</p>

  <p id="reviews" class="text-l">Reviews</p>
  <div class="write-a-review">
    
  </div>

  {#if comments}
    <div class="comment-container">
      {#if comments.length === 0}
        <p class="text-center text-l">No comments</p>
      {:else}
        {#each comments as comment}
          <Comment data={comment} />
        {/each}
      {/if}
    </div>
  {:else}
    <a href="{$page.url.href}/comments#reviews">Show Reviews</a>
  {/if}
</div>

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
    display: flex;
    justify-items: center;
    align-items: left;
    flex-direction: column;
    word-wrap: break-word;
  }

  .comment-container {
    margin-bottom: 1rem;
  }

  .main-img {
    height: 22.5rem;
    max-height: 22.5rem;
    align-self: center;
    object-fit: contain;
    object-position: center;
  }

  .no-margin {
    margin: 0;
  }

  .text-m {
    font-size: 1.25rem;
  }

  .text-l {
    font-size: 1.6875rem;
  }

  .text-xl {
    font-size: 2.25rem;
  }

  .text-center {
    text-align: center;
  }
</style>
