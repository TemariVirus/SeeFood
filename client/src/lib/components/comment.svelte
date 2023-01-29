<script lang="ts">
  import guestPfp from "$lib/images/guest-pfp.svg";
  import starEmpty from "$lib/images/star-empty.svg";
  import starFull from "$lib/images/star-full.svg";
  import editIcon from "$lib/images/edit.svg";
  import deleteIcon from "$lib/images/delete.svg";
  import type { IComment } from "$lib/server/entities";

  export let data: IComment;
</script>

<div class="comment {data.is_reply ? 'reply' : ''}">
  <div class="flex-center">
    <img src={guestPfp} alt="Profile" class="profile-picture" />
    <div class="align-row">
      <p class="text-m">{data.username}</p>
      <p class="text-s">{new Date(data.date).toDateString()}</p>
      <div class="btn-container">
        <img src={editIcon} alt="Edit" class="btn-icon" />
        <img src={deleteIcon} alt="Delete" class="btn-icon" />
      </div>
    </div>
  </div>
  {#if data.rating}
    <div class="flex-center mt-1">
      {#each Array.from({ length: 5 }) as _, i}
        <img
          src={i < data.rating ? starFull : starEmpty}
          alt={i < data.rating ? "Full star" : "Empty star"}
          class="star"
        />
      {/each}
    </div>
  {/if}
  <div class="mt-1 long-text">{data.content}</div>
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

  .flex-center {
    display: flex;
    align-items: center;
  }

  .align-row {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .align-row > * {
    margin: auto;
    margin-left: 0.375rem;
    text-align: center;
  }

  .mt-1 {
    margin-top: 0.375rem;
  }

  .profile-picture {
    width: 1.5625rem;
    height: 1.5625rem;
    border-radius: 2rem;
  }

  .star {
    width: 1rem;
    height: 1rem;
  }

  .text-m {
    font-size: 1.25rem;
  }

  .text-s {
    font-size: 0.75rem;
  }

  .long-text {
    white-space: pre-line;
  }

  .btn-icon {
    width: 1.125rem;
    margin-left: 0.375rem;
  }
</style>
