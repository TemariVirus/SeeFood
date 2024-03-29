<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { authStore } from "$lib/stores/auth";
  import { handleApiError } from "$lib/client/responseHandlers";
  import StarFull from "$lib/images/star-full.svg";
  import StarEmpty from "$lib/images/star-empty.svg";

  export let comment: any = null;
  export let show = false;
  export let edit = false;

  const isReply = comment?.isReply ?? false;
  let newComment = {
    content: "",
    rating: 0,
    parentId: Number.parseInt($page.params.id),
    isReply: false,
    ...comment,
  };

  function setRating(rating: number) {
    if ($authStore.user === null || $authStore.token === null) {
      goto("/login");
      return;
    }
    newComment.rating = rating;
  }

  function cancel() {
    show = false;
    if (!comment) {
      newComment.content = "";
      newComment.rating = 0;
    }
  }

  function done() {
    if ($authStore.user === null || $authStore.token === null) {
      goto("/login");
      return;
    }

    fetch(`/comments${edit ? "/" + comment.id : ""}`, {
      method: edit ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + $authStore.token,
      },
      body: JSON.stringify({
        content: newComment.content?.trim(),
        rating: newComment.rating,
        parentId: newComment.parentId,
        isReply: newComment.isReply,
      }),
    }).then(async (res) => {
      console.log(res);
      if (res.ok) {
        location.reload();
      } else {
        await handleApiError(res);
      }
    });
  }
</script>

<div class="container">
  {#if !isReply}
    <div class="star-container">
      {#each [1, 2, 3, 4, 5] as star}
        {#if star <= (newComment?.rating ?? 0)}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <img
            class="star"
            src={StarFull}
            alt="Full star"
            on:click={() => setRating(newComment.rating == star ? 0 : star)}
          />
        {:else}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <img
            class="star"
            src={StarEmpty}
            alt="Empty star"
            on:click={() => setRating(star)}
          />
        {/if}
      {/each}
    </div>
  {/if}

  <textarea
    class="comment-text"
    placeholder="Write a comment..."
    bind:value={newComment.content}
    on:focus={() => {
      if ($authStore.user === null || $authStore.token === null) {
        goto("/login");
      }
    }}
  />
  <div class="form-btns">
    <button on:click={cancel}>Cancel</button>
    <button on:click={done}>Done</button>
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: left;
    margin-bottom: 1.875rem;
  }

  .star-container {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .star {
    width: 2rem;
    cursor: pointer;
  }

  .comment-text {
    width: 100%;
    height: 8.5rem;
    margin-top: 0.5rem;
    padding: 0.5rem;
    border: 1px solid #333;
    border-radius: 0.25rem;
    background-color: #333;
    color: var(--text-color);
    font-size: 1rem;
    resize: none;
  }

  .form-btns {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }
</style>
