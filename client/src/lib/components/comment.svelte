<script lang="ts">
  import guestPfp from "$lib/images/guest-pfp.svg";
  import starEmpty from "$lib/images/star-empty.svg";
  import starFull from "$lib/images/star-full.svg";
  import editIcon from "$lib/images/edit.svg";
  import deleteIcon from "$lib/images/delete.svg";

  import { commentsDeleteUrl } from "$lib/urls";
  import type { IComment } from "$lib/server/entities";

  export let data: IComment;

  function editComment() {}

  function deleteComment() {
    fetch(commentsDeleteUrl(data.id, data.is_reply), {
      method: "DELETE",
      headers: {
        Authorization: "Basic " + btoa("Admin:1234"),
      },
    }).then(async (res) => {
      console.log(res);
      if (res.ok) {
        alert("Comment deleted successfully");
        // TODO: Refresh comments
      } else {
        const message = await res.json();
        alert(message ?? "Error posting comment");
      }
    });
  }
</script>

{#if data.content}
  <div class="comment {data.is_reply ? 'reply' : ''}">
    <div style="display: flex;">
      <img src={guestPfp} alt="Profile" class="profile-picture" />
      <div class="align-row">
        <p class="text-m">{data.username}</p>
        <p class="text-s">{new Date(data.date).toDateString()}</p>
        <div class="btn-container">
          <button on:click={editComment}>
            <img src={editIcon} alt="Edit" class="btn-icon" />
          </button>
          <button on:click={deleteComment}>
            <img src={deleteIcon} alt="Delete" class="btn-icon" />
          </button>
        </div>
      </div>
    </div>
    {#if data.rating !== undefined}
      <div class="star-container">
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
