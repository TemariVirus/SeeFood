<script lang="ts">
  import { page } from "$app/stores";
  import { authStore } from "$lib/stores/auth";
  import type { IComment } from "$lib/server/entities";
  import { clientHandleApiError } from "$lib/responseHandlers";

  import StarFull from "$lib/images/star-full.svg";
  import StarEmpty from "$lib/images/star-empty.svg";
  import { goto } from "$app/navigation";

  export let comment: null | IComment = null;
  export let show = false;

  const isReply = comment?.isReply ?? false;
  let newComment = {
    content: "",
    rating: 0,
    parentId: Number.parseInt($page.params.id),
    isReply: false,
    ...comment,
  };

  function cancel() {
    show = false;
    if (!comment) {
      newComment.content = "";
      newComment.rating = 0;
    }
  }

  function done() {
    if (comment) {
      fetch(`/comments?isReply=${isReply}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + $authStore.token,
        },
        body: JSON.stringify({
          content: newComment.content?.trim(),
          rating: newComment.rating,
        }),
      }).then(async (res) => {
        if (res.ok) {
          alert("Comment edited successfully");
          // TODO: Refresh comments
        } else {
          const message = await res.json();
          alert(message ?? "Error editing comment");
        }
      });
    } else {
      fetch(`/comments`, {
        method: "POST",
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
        if (res.ok) {
          alert("Comment posted successfully");
          goto($page.url);
        } else {
          clientHandleApiError(res);
        }
      });
    }
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
            on:click={() =>
              (newComment.rating = newComment.rating == star ? 0 : star)}
          />
        {:else}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <img
            class="star"
            src={StarEmpty}
            alt="Empty star"
            on:click={() => (newComment.rating = star)}
          />
        {/if}
      {/each}
    </div>
  {/if}

  <textarea
    class="comment-text"
    placeholder="Write a comment..."
    bind:value={newComment.content}
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
