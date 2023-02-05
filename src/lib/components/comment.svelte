<script lang="ts">
  import { goto } from "$app/navigation";
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
  let reply = {
    content: comment.isReply ? `@${comment.userName} ` : "",
    rating: undefined,
    parentId: comment.reviewId ?? comment.id,
    isReply: true,
  };
  let showCommentEditor = false,
    showReplyEditor = false;

  function editComment() {
    showCommentEditor = true;
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

  function addReply() {
    if ($authStore.user === null || $authStore.token === null) {
      goto("/login");
      return;
    }
    showReplyEditor = true;
  }
</script>

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
      {#if $authStore.user?.name === comment.userName && !showReplyEditor}
        <div class="btn-container">
          {#if comment.content}
            <button class="btn-icon" on:click={editComment}>
              <img src={editIcon} alt="Edit" />
            </button>
          {/if}
          <button class="btn-icon" on:click={deleteComment}>
            <img src={deleteIcon} alt="Delete" />
          </button>
        </div>
      {/if}
    </div>
  </div>

  {#if comment.content && showCommentEditor}
    <CommentEditor {comment} bind:show={showCommentEditor} edit={true} />
  {:else}
    {#if comment.rating !== undefined}
      <div class="star-container">
        {#each Array(5) as _, i}
          <img
            src={i < comment.rating ? starFull : starEmpty}
            alt={i < comment.rating ? "Full star" : "Empty star"}
            class="star"
          />
        {/each}
      </div>
    {/if}
    {#if comment.content}
      <div class="mt-1 long-text">{comment.content}</div>
      {#if showReplyEditor}
        <CommentEditor
          comment={reply}
          bind:show={showReplyEditor}
          edit={false}
        />
      {:else}
        <button class="reply-btn" on:click={addReply}>Reply</button>
      {/if}
    {/if}
  {/if}
</div>

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

  .reply-btn {
    border: 0;
    border-radius: 9999px;
    color: #fff;
    text-decoration: solid;
    padding: 0.2rem 0.5rem;
    margin: 0.25rem 0;
  }

  .reply-btn:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
  .reply-btn:active {
    background-color: rgba(255, 255, 255, 0.4);
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
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin: 0;
    margin-left: 0.375rem;
  }
</style>
