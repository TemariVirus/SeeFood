<script lang="ts">
  import { authStore } from "$lib/stores/auth";
  import type { IComment } from "$lib/entities";
  import { handleApiError } from "$lib/client/responseHandlers";

  import guestPfp from "$lib/images/guest-pfp.svg";
  import starEmpty from "$lib/images/star-empty.svg";
  import starFull from "$lib/images/star-full.svg";
  import editIcon from "$lib/images/edit.svg";
  import deleteIcon from "$lib/images/delete.svg";
  import CommentEditor from "$lib/components/commentEditor.svelte";

  export let comment: IComment;
  let showEditor = false;

  function editComment() {
    showEditor = true;
  }

  function deleteComment() {
    fetch(`/comments/${comment.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${$authStore.token}`,
      },
    }).then(async (res) => {
      if (res.ok) {
        location.reload();
      } else {
        await handleApiError(res);
      }
    });
  }
</script>

{#if comment.content}
  <div class="comment {comment.isReply ? 'reply' : ''}">
    <div style="display: flex;">
      <img
        src={guestPfp}
        alt="{comment.userName}'s profile"
        class="profile-picture"
      />
      <div class="align-row">
        <p class="text-m">{comment.userName}</p>
        <p class="text-s">{new Date(comment.date).toDateString()}</p>
        {#if $authStore.user?.name === comment.userName}
          <div class="btn-container">
            <button on:click={editComment}>
              <img src={editIcon} alt="Edit" class="btn-icon" />
            </button>
            <button on:click={deleteComment}>
              <img src={deleteIcon} alt="Delete" class="btn-icon" />
            </button>
          </div>
        {/if}
      </div>
    </div>

    {#if showEditor}
      <CommentEditor {comment} bind:show={showEditor} />
    {:else}
      {#if comment.rating !== undefined}
        <div class="star-container">
          {#each Array.from({ length: 5 }) as _, i}
            <img
              src={i < comment.rating ? starFull : starEmpty}
              alt={i < comment.rating ? "Full star" : "Empty star"}
              class="star"
            />
          {/each}
        </div>
      {/if}
      <div class="mt-1 long-text">{comment.content}</div>
    {/if}
  </div>
{/if}

<style>
  .comment:not(:first-child) {
    margin-top: 1rem;
  }

  .reply {
    margin-left: 1.5rem;
  }

  .btn-container {
    margin-left: 0.1875rem;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin: 0;
    margin-left: 0.375rem;
  }

  .profile-picture {
    width: 1.5625rem;
    height: 1.5625rem;
    border-radius: 2rem;
  }

  .star-container {
    display: flex;
    align-items: center;
    margin-top: 0.375rem;
  }

  .star {
    width: 1rem;
    height: 1rem;
  }

  .long-text {
    white-space: pre-line;
  }

  .btn-icon {
    width: 1.125rem;
    height: 1.125rem;
  }
</style>
